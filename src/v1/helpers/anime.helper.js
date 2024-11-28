import { AppErrorTypes } from "../utils/appError.js";
import { animeMappingHelper } from "./index.js";
import { anilistClient } from "../config/index.js";
import anilistQuery from "../models/anilist/index.js";
import { handleErrorInApiFunctions } from "../utils/errorUtils.js";
import { DB_CONFIG } from "../constants/index.js";
import { animeDBHelper, animeEpisodesHelper } from "./index.js";
import { getIdFieldForProvider } from "../utils/getIdFieldForProvider.js";

class AnimeHelper {
  _getQueryByProvider(provider, animeId) {
    switch (provider) {
      case "anilist":
        return anilistQuery.InfoQuery(animeId);
      case "mal":
        return anilistQuery.InfoQueryByMalId(animeId);
      default:
        return null;
    }
  }

  async fetchAnimeInfo(animeId, provider) {
    try {
      const query = this._getQueryByProvider(provider, animeId);
      if (!query) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }

      const { data } = await anilistClient.post("", { query });
      const media = data?.data?.Media;
      if (!media) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }

      const mappedAnimeData = await animeMappingHelper.getMappedAnimeData(
        media.id,
        media
      );

      if (!mappedAnimeData) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }

      return mappedAnimeData;
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeHelper.fetchAnimeInfo");
    }
  }

  async searchAnimeInfoByTitle(title, page, limit) {
    return this._fetchAnimeList(
      "getAnimeByTitle",
      null,
      page,
      limit,
      "AnimeHelper.searchAnimeInfoByTitle",
      title
    );
  }

  async fetchLatestAiringAnimeInfo(page, limit) {
    return this._fetchAnimeList(
      "getLatestAiringAnime",
      null,
      page,
      limit,
      "AnimeHelper.fetchLatestAiringAnimeInfo"
    );
  }

  async fetchTrendingAnimeInfo(page, limit) {
    return this._fetchAnimeList(
      "getTrendingAnime",
      anilistQuery.TrendingQuery,
      page,
      limit,
      "AnimeHelper.fetchTrendingAnime"
    );
  }

  async fetchPopularAnimeInfo(page, limit) {
    return this._fetchAnimeList(
      "getPopularAnime",
      anilistQuery.PopularQuery,
      page,
      limit,
      "AnimeHelper.fetchPopularAnime"
    );
  }

  async fetchAnimeInfoByPage(page, limit, year, season) {
    return this._fetchAnimeList(
      "getAnimeByPage",
      anilistQuery.InfoQueryByPage,
      page,
      limit,
      "AnimeHelper.fetchAnimeInfoByPage",
      year,
      season
    );
  }

  async _fetchAnimeList(
    dbMethod,
    queryMethod,
    page,
    limit,
    errorContext,
    ...args
  ) {
    try {
      let results;
      if (DB_CONFIG.isEnabled) {
        const response = await animeDBHelper[dbMethod](page, limit, ...args);
        results = {
          data: response?.data,
          pagination: response?.pagination,
        };
      } else if (queryMethod) {
        const { data } = await anilistClient.post("", {
          query: queryMethod(page, limit, ...args),
        });
        const media = data?.data?.Page?.media;
        if (!media) {
          throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
        }

        const mappingPromises = media.map(async (animeData) => {
          return await animeMappingHelper.getMappedAnimeData(
            animeData.id,
            animeData
          );
        });

        results = {
          data: await Promise.all(mappingPromises),
          pagination: data.data.Page.pageInfo,
        };
      } else {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }

      if (!results) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }
      return results;
    } catch (error) {
      handleErrorInApiFunctions(error, errorContext);
    }
  }

  async fetchAnimeStreamLink(animeId, episodeNumber, provider, type) {
    try {
      const streamData = await this._getStreamData(
        animeId,
        episodeNumber,
        provider,
        type
      );
      if (!streamData) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND(
          `The resource you are looking for is not found, it may be available in the future. or try using ${
            type === "sub" ? "dub" : "sub"
          } type.`
        );
      }
      return streamData;
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeHelper.fetchAnimeStreamLink");
    }
  }

  async _getStreamData(animeId, episodeNumber, provider, type) {
    if (provider === "gogo") {
      return await animeEpisodesHelper.getAnimeStreamData(
        animeId,
        episodeNumber
      );
    }

    const isDub = type === "dub";
    const idField = getIdFieldForProvider(provider, isDub);

    let animeSyncData = await animeDBHelper.getAnimeSyncInfo(idField, animeId);

    if (!animeSyncData) {
      const animeData = await this.fetchAnimeInfo(animeId, provider);
      await animeDBHelper.saveAnimeData(animeData);
      animeSyncData = animeData.animeSyncData;
    }

    if (!animeSyncData) {
      return null;
    }

    return await animeEpisodesHelper.getAnimeStreamData(
      isDub ? animeSyncData.idGogoDub : animeSyncData.idGogo,
      episodeNumber
    );
  }

  async fetchRandomAnimeInfo(isStreamable) {
    try {
      const animeData = await animeDBHelper.getRandomAnimeData(isStreamable);
      if (!animeData) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }
      return animeData;
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeHelper.fetchRandomAnimeInfo");
    }
  }

  async fetchAnimeEpisodesInfo(animeId, provider) {
    try {
      const idField = getIdFieldForProvider(provider);
      let animeData = await animeDBHelper.getAnimeData(idField, animeId);

      if (!animeData) {
        animeData = await this.fetchAnimeInfo(animeId, provider);
        await animeDBHelper.saveAnimeData(animeData);
      }

      const episodesData = await animeEpisodesHelper.getAnimeEpisodesData(
        animeData?.animeSyncData?.idMal,
        animeData?.idAni,
        animeData
      );

      if (!episodesData) {
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      }
      return episodesData;
    } catch (error) {
      handleErrorInApiFunctions(error, "AnimeHelper.fetchAnimeEpisodesInfo");
    }
  }
}

export const animeHelper = new AnimeHelper();
