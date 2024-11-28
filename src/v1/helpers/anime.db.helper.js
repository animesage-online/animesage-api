import { dbHelper } from "./db.helper.js";
import { handleErrorInDatabaseFunctions } from "../utils/errorUtils.js";
import { DB_CONFIG } from "../constants/index.js";
import { getCurrentDate } from "../utils/dateUtils.js";

class AnimeDBHelper {
  constructor() {
    this.tables = {
      ANIME_DATA: "anime_data",
      SYNC_INFO: "anime_sync_info",
      TRENDING: "trending",
      SCHEDULE: "weekly_schedule",
      REFETCH: "anime_to_refetch",
      EPISODES_DATA: "anime_episodes_data",
    };
  }

  _validateConfig(data) {
    return DB_CONFIG?.isEnabled && data;
  }

  _prepareAnimeData(animeData) {
    return {
      idAni: animeData.idAni,
      idMal: animeData.animeSyncData?.idMal,
      idGogo: animeData.animeSyncData?.idGogo,
      title_en: animeData.title?.english,
      title_romaji: animeData.title?.romaji,
      countryOfOrigin: animeData.countryOfOrigin,
      genres: animeData.genres.join(", "),
      tags: animeData.tags.map((tag) => tag.name).join(", "),
      status: animeData.status,
      format: animeData.format,
      year: animeData.year,
      season: animeData.season,
      studios: animeData.studios.map((studio) => studio.name).join(", "),
      isAdult: animeData.isAdult ? 1 : 0,
      nextAiringAt: animeData.nextair?.airingAt,
      popularity: animeData.popularity,
      animeData: JSON.stringify(animeData),
    };
  }

  _prepareSyncInfo(animeData) {
    return {
      idAni: animeData.idAni,
      idMal: animeData.animeSyncData?.idMal,
      idGogo: animeData.animeSyncData?.idGogo,
      idGogoDub: animeData.animeSyncData?.idGogoDub,
      idZoro: animeData.animeSyncData?.idZoro,
      idPahe: animeData.animeSyncData?.idPahe,
      idNotifyMoe: animeData.animeSyncData?.idNotifyMoe,
      idKitsu: animeData.animeSyncData?.idKitsu,
      idAnidb: animeData.animeSyncData?.idAnidb,
      idAnimePlanet: animeData.animeSyncData?.idAnimePlanet,
      idLivechart: animeData.animeSyncData?.idLivechart,
      idAnisearch: animeData.animeSyncData?.idAnisearch,
    };
  }

  _prepareRefetchData(animeData) {
    return {
      idAni: animeData.idAni,
      title_en: animeData.title?.english,
      title_romaji: animeData.title?.romaji,
      status: animeData.status,
      nextAiringAt: animeData.nextair?.airingAt,
    };
  }

  _prepareEpisodesData(episodesData) {
    return {
      idAni: episodesData.idAni,
      title_en: episodesData.title?.english,
      title_romaji: episodesData.title?.romaji,
      episodesData: JSON.stringify(episodesData),
    };
  }

  _parseJsonField(data, fieldName) {
    if (!data || !data[fieldName]) {
      return null;
    }
    try {
      return JSON.parse(data[fieldName]);
    } catch {
      return null;
    }
  }

  async _processAnimeData(animeDataResults, episodesDataResults) {
    if (
      !this._validateConfig(animeDataResults) ||
      !this._validateConfig(episodesDataResults)
    ) {
      return;
    }

    const animeDataValues = animeDataResults.map(this._prepareAnimeData);
    const animeSyncInfoValues = animeDataResults.map(this._prepareSyncInfo);
    const episodesDataValues = episodesDataResults.map(
      this._prepareEpisodesData
    );
    const animeToRefetchValues = animeDataResults
      .filter(
        (anime) =>
          anime.status === "RELEASING" &&
          anime.nextair?.airingAt * 1000 > Date.now()
      )
      .map(this._prepareRefetchData);

    if (animeDataValues.length > 0) {
      await dbHelper.batchInsert(this.tables.SYNC_INFO, animeSyncInfoValues);

      await Promise.all([
        dbHelper.batchInsert(this.tables.ANIME_DATA, animeDataValues),
        animeToRefetchValues.length > 0
          ? dbHelper.batchInsert(this.tables.REFETCH, animeToRefetchValues)
          : Promise.resolve(),
        episodesDataValues.length > 0
          ? dbHelper.batchInsert(this.tables.EPISODES_DATA, episodesDataValues)
          : Promise.resolve(),
      ]);
    }
  }

  async saveAnimeData(animeData) {
    try {
      if (!this._validateConfig(animeData)) {
        return;
      }
      await this._processAnimeData([animeData], []);
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.saveAnimeData");
    }
  }

  async saveAnimeDataByPage(animeDataResults, episodesDataResults) {
    try {
      if (
        !this._validateConfig(animeDataResults) ||
        !this._validateConfig(episodesDataResults)
      ) {
        return;
      }

      await this._processAnimeData(animeDataResults, episodesDataResults);
    } catch (error) {
      handleErrorInDatabaseFunctions(
        error,
        "AnimeDBHelper.saveAnimeDataByPage"
      );
    }
  }

  async saveEpisodesData(episodesData) {
    try {
      if (!this._validateConfig(episodesData)) {
        return;
      }
      const data = this._prepareEpisodesData(episodesData);
      await dbHelper.insert(this.tables.EPISODES_DATA, data);
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.saveEpisodesData");
    }
  }

  async saveTrendingAnime(trendingResults, episodesResults) {
    try {
      if (
        !this._validateConfig(trendingResults) ||
        !this._validateConfig(episodesResults)
      ) {
        return;
      }

      await dbHelper.truncateTable(this.tables.TRENDING);

      const trendingAnimeValues = trendingResults.map((anime) => ({
        idAni: anime.idAni,
        animeData: JSON.stringify(anime),
      }));

      await this._processAnimeData(trendingResults, episodesResults);

      await dbHelper.batchInsert(this.tables.TRENDING, trendingAnimeValues);
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.saveTrendingAnime");
    }
  }

  async getAnimeData(field, value) {
    if (!DB_CONFIG?.isEnabled || !field || !value) {
      return null;
    }

    try {
      let data;

      if (field === "idAni" || field === "idMal" || field === "idGogo") {
        data = await dbHelper.findOne(this.tables.ANIME_DATA, {
          [field]: value,
        });
      } else {
        data = await dbHelper.findDataByForeignKey(
          this.tables.SYNC_INFO,
          this.tables.ANIME_DATA,
          {
            [field]: value,
          }
        );
      }

      const animeData = this._parseJsonField(data, "animeData");

      return animeData;
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.getAnimeData");
    }
  }

  async getEpisodesData(field, value) {
    if (!DB_CONFIG?.isEnabled || !field || !value) {
      return null;
    }

    try {
      let data;

      if (field === "idAni") {
        data = await dbHelper.findOne(this.tables.EPISODES_DATA, {
          [field]: value,
        });
      } else {
        data = await dbHelper.findDataByForeignKey(
          this.tables.SYNC_INFO,
          this.tables.EPISODES_DATA,
          {
            [field]: value,
          }
        );
      }

      const episodesData = {
        ...(field !== "idAni" && { [field]: value }),
        ...this._parseJsonField(data, "episodesData"),
      };

      return data ? episodesData : null;
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.getEpisodesData");
    }
  }

  async getTrendingAnime(page, limit) {
    if (!DB_CONFIG?.isEnabled || !page || !limit) {
      return null;
    }

    try {
      const trendingData = await dbHelper.getPaginatedData(
        this.tables.TRENDING,
        {},
        page,
        limit
      );

      return {
        data: trendingData?.data?.map((item) =>
          this._parseJsonField(item, "animeData")
        ),
        pagination: trendingData?.pagination || null,
      };
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.getTrendingAnime");
    }
  }

  async getPopularAnime(page, limit) {
    if (!DB_CONFIG?.isEnabled || !page || !limit) {
      return null;
    }

    try {
      const data = await dbHelper.getPaginatedData(
        this.tables.ANIME_DATA,
        {},
        page,
        limit,
        "popularity DESC"
      );

      return {
        data: data.data.map((item) => this._parseJsonField(item, "animeData")),
        pagination: data.pagination ? data.pagination : null,
      };
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.getPopularAnime");
    }
  }

  async getAnimeByPage(page, limit, year, season) {
    if (!DB_CONFIG?.isEnabled || !page || !limit) {
      return null;
    }

    try {
      const data = await dbHelper.getPaginatedData(
        this.tables.ANIME_DATA,
        { ...(year && { year: year }), ...(season && { season: season }) },
        page,
        limit
      );

      return {
        data: data.data.map((item) => this._parseJsonField(item, "animeData")),
        pagination: data.pagination ? data.pagination : null,
      };
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.getAnimeByPage");
    }
  }

  async getLatestAiringAnime(page, limit) {
    if (!DB_CONFIG?.isEnabled || !page || !limit) {
      return null;
    }

    try {
      const animeResults = [];
      const currentDate = getCurrentDate();
      const currentYear = parseInt(currentDate.split(" ")[2], 10);

      const conditions = {
        year: currentYear,
        status: "RELEASING",
      };

      const data = await dbHelper.getPaginatedData(
        this.tables.ANIME_DATA,
        conditions,
        page,
        limit
      );

      data.data.forEach((item) => {
        const animeData = this._parseJsonField(item, "animeData");
        if (animeData.nextair?.airingAt * 1000 > Date.now()) {
          animeResults.push(animeData);
        }
      });

      animeResults.sort((a, b) => {
        return b.nextair?.airingAt - a.nextair?.airingAt;
      });

      return {
        data: animeResults,
        pagination: data.pagination ? data.pagination : null,
      };
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.getAnimeByPage");
    }
  }

  async getAnimeSyncInfo(field, value) {
    if (!DB_CONFIG?.isEnabled || !field || !value) {
      return null;
    }

    try {
      const data = await dbHelper.findOne(this.tables.SYNC_INFO, {
        [field]: value,
      });

      return data ? data : null;
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.getAnimeSyncInfo");
    }
  }

  async getAnimeByTitle(page, limit, title) {
    if (!DB_CONFIG?.isEnabled || !title || !page || !limit) {
      return null;
    }

    try {
      const searchFields = ["title_en", "title_romaji"];

      const data = await dbHelper.search(
        this.tables.ANIME_DATA,
        {
          [searchFields]: title,
        },
        page,
        limit
      );

      return {
        data: data?.data?.map((item) =>
          this._parseJsonField(item, "animeData")
        ),
        pagination: data?.pagination ? data.pagination : null,
      };
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.searchAnimeByTitle");
    }
  }

  async getRandomAnimeData(isStreamable) {
    if (!DB_CONFIG?.isEnabled) {
      return null;
    }

    try {
      const condition = {};
      if (isStreamable) {
        condition.idGogo = "IS NOT NULL";
      }

      const data = await dbHelper.findOne(
        this.tables.ANIME_DATA,
        condition,
        "RAND()"
      );

      return this._parseJsonField(data, "animeData");
    } catch (error) {
      handleErrorInDatabaseFunctions(error, "AnimeDBHelper.getRandomAnimeData");
    }
  }
}

export const animeDBHelper = new AnimeDBHelper();
