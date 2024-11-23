import { AppErrorTypes } from "../utils/appError.js";
import { animeHelper, animeDBHelper } from "../helpers/index.js";
import { handleErrorInApiFunctions } from "../utils/errorUtils.js";
import { getCurrentDate } from "../utils/dateUtils.js";
import { getIdFieldForProvider } from "../utils/getIdFieldForProvider.js";

class AnimeService {
  static VALID_PROVIDERS = new Set([
    "anilist",
    "mal",
    "gogo",
    "zoro",
    "pahe",
    "notifymoe",
    "kitsu",
    "anidb",
    "livechart",
    "anisearch",
    "animeplanet",
  ]);

  static STREAMING_PROVIDERS = new Set(["anilist", "mal", "gogo"]);

  static SEASONS = new Set(["winter", "spring", "summer", "fall"]);

  static PAGINATION_LIMITS = {
    MIN: 1,
    MAX: 50,
  };

  _validatePagination(page, limit) {
    if (!page || !limit) {
      return;
    }

    if (
      isNaN(limit) ||
      limit < AnimeService.PAGINATION_LIMITS.MIN ||
      limit > AnimeService.PAGINATION_LIMITS.MAX
    ) {
      throw AppErrorTypes.API.INVALID_REQUEST(
        `Invalid limit, limit must be between ${AnimeService.PAGINATION_LIMITS.MIN} and ${AnimeService.PAGINATION_LIMITS.MAX}`
      );
    }

    if (isNaN(page) || page < AnimeService.PAGINATION_LIMITS.MIN) {
      throw AppErrorTypes.API.INVALID_REQUEST(
        "Invalid page, page must be greater than 0"
      );
    }
  }

  _validateProvider(provider, allowedProviders = AnimeService.VALID_PROVIDERS) {
    if (provider && !allowedProviders.has(provider)) {
      throw AppErrorTypes.API.INVALID_REQUEST("Invalid provider");
    }
  }

  _createResponse(statusCode, message, data, pagination = null) {
    return {
      statusCode,
      message,
      results: data,
      ...(pagination && { pagination }),
    };
  }

  async _getPaginatedData(fetchFunction, page, limit, message) {
    try {
      this._validatePagination(page, limit);

      const { data, pagination } = await fetchFunction(page, limit);

      if (!data) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }

      return this._createResponse(200, message, data, pagination);
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeService._getPaginatedData");
    }
  }

  async getAnimeInfo(animeId, provider) {
    try {
      if (!animeId) {
        throw AppErrorTypes.API.MISSING_PARAMETERS("Anime ID is required");
      }

      this._validateProvider(provider);

      let animeData;
      const isDub =
        provider === "gogo" && animeId.toLowerCase().includes("-dub");
      const idField = getIdFieldForProvider(provider, isDub);

      animeData = await animeDBHelper.getAnimeData(idField, animeId);

      if (!animeData && ["anilist", "mal"].includes(provider)) {
        animeData = await animeHelper.fetchAnimeInfo(animeId, provider);
        await animeDBHelper.saveAnimeData(animeData);
      }

      if (!animeData) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }

      return this._createResponse(
        200,
        `Anime information about: ${
          animeData.title?.english || animeData.title?.romaji
        }`,
        animeData
      );
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeService.getAnimeInfo");
    }
  }

  async searchAnimeByTitle(title, page, limit) {
    try {
      if (!title) {
        throw AppErrorTypes.API.MISSING_PARAMETERS("No title provided");
      }

      return await this._getPaginatedData(
        () => animeHelper.searchAnimeInfoByTitle(title, page, limit),
        page,
        limit,
        `Showing results for ${title}`
      );
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeService.searchAnime");
    }
  }

  async getTrendingAnimeInfo(page, limit) {
    try {
      return await this._getPaginatedData(
        () => animeHelper.fetchTrendingAnimeInfo(page, limit),
        page,
        limit,
        `Trending anime as of ${getCurrentDate()}`
      );
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeService.getTrendingAnime");
    }
  }

  async getLatestAiringAnime(page, limit) {
    return await this._getPaginatedData(
      () => animeHelper.fetchLatestAiringAnimeInfo(page, limit),
      page,
      limit,
      `Latest airing anime`
    );
  }

  async getPopularAnimeInfo(page, limit) {
    try {
      return await this._getPaginatedData(
        () => animeHelper.fetchPopularAnimeInfo(page, limit),
        page,
        limit,
        `Popular anime as of ${getCurrentDate()}`
      );
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeService.getPopularAnime");
    }
  }

  async getAnimeByPage(page, limit, year, season) {
    try {
      if (season && !AnimeService.SEASONS.has(season)) {
        throw AppErrorTypes.API.INVALID_REQUEST("Invalid season");
      }

      return await this._getPaginatedData(
        () => animeHelper.fetchAnimeInfoByPage(page, limit, year, season),
        page,
        limit,
        `Anime page no ${page}`
      );
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeService.getAnimeByPage");
    }
  }

  async getStreamingInfo(animeId, episodeNumber, provider, type) {
    try {
      if (!animeId || !episodeNumber) {
        throw AppErrorTypes.API.MISSING_PARAMETERS(
          "Anime ID and episode number are required"
        );
      }

      if (type !== "sub" && type !== "dub") {
        throw AppErrorTypes.API.INVALID_REQUEST(
          "Invalid type, must be 'sub' or 'dub'"
        );
      }

      this._validateProvider(provider, AnimeService.STREAMING_PROVIDERS);

      const streamData = await animeHelper.fetchAnimeStreamLink(
        animeId,
        episodeNumber,
        provider,
        type
      );

      if (!streamData) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }

      return this._createResponse(
        200,
        `Streaming link for episode ${streamData.info.episode} of ${streamData.info.title}`,
        streamData
      );
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeService.getStreamLink");
    }
  }

  async getRandomAnimeInfo() {
    try {
      const animeData = await animeHelper.fetchRandomAnimeInfo();
      if (!animeData) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }

      return this._createResponse(
        200,
        `Anime information about: ${
          animeData.title?.english || animeData.title?.romaji
        }`,
        animeData
      );
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeService.getRandomAnimeInfo");
    }
  }

  async getEpisodesInfoByAnimeId(animeId, provider) {
    try {
      if (!animeId) {
        throw AppErrorTypes.API.MISSING_PARAMETERS("Anime ID is required");
      }

      this._validateProvider(provider);

      const isDub =
        provider === "gogo" && animeId.toLowerCase().includes("-dub");
      const idField = getIdFieldForProvider(provider, isDub);

      let episodesData = await animeDBHelper.getEpisodesData(idField, animeId);

      if (!episodesData && ["anilist", "mal"].includes(provider)) {
        episodesData = await animeHelper.fetchAnimeEpisodesInfo(
          animeId,
          provider
        );
        await animeDBHelper.saveEpisodesData(episodesData);
        if (provider === "mal") {
          episodesData = { idMal: animeId, ...episodesData };
        }
      }

      if (!episodesData) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }

      return this._createResponse(
        200,
        `Episodes information of ${
          episodesData.title?.english || episodesData.title?.romaji
        }`,
        episodesData
      );
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeService.getEpisodesInfoByAnimeId");
    }
  }
}

export const animeService = new AnimeService();
