import { APP_CONFIG, DB_CONFIG } from "../constants/constants.js";
import { AppErrorTypes } from "../utils/appError.js";
import anilistQuery from "../models/anilist/index.js";
import { anilistClient } from "../config/index.js";
import { animeMappingHelper } from "../helpers/anime.mapping.helper.js";
import { animeDBHelper, animeEpisodesHelper } from "../helpers/index.js";
import { delay } from "../utils/delayUtils.js";

class AnimeSeedingHelper {
  constructor() {
    this.LIMIT = 50;
    this.isSeedingRunning = false;
    this.SEEDING_WAIT_TIME = 1000 * 60 * 7;
    this.MAX_TRIES = 7;
  }

  async seedAnimeDataInDB() {
    if (!DB_CONFIG?.isEnabled) {
      return;
    }

    try {
      // Uncomment as needed
      // await this.seedTrendingAnime();
      // // await delay(1000 * 60);
      // await this.seedAnimeInfo();
    } catch (error) {
      throw AppErrorTypes.DATABASE.SEEDING_FAILED();
    }

    if (APP_CONFIG?.isDevelopment) {
      console.log("Anime data seeded successfully");
    }
  }

  async waitForSeedingAvailability() {
    let tries = 0;
    while (this.isSeedingRunning) {
      await delay(this.SEEDING_WAIT_TIME);
      tries++;
      if (tries >= this.MAX_TRIES) {
        throw AppErrorTypes.API.SEEDING_TIMEOUT();
      }
    }
    this.isSeedingRunning = true;
  }

  async processAnimePage(
    page,
    limit,
    queryFunction,
    whichDataToSave = "default"
  ) {
    try {
      const response = await anilistClient.post("", {
        query: queryFunction(page, limit),
      });

      if (!response?.data?.data?.Page?.media) {
        return { animeResults: [], episodesResults: [] };
      }

      const mappingTask = Promise.all(
        response.data.data.Page.media.map(async (animeData) => {
          const mappedAnimeData = await animeMappingHelper.getMappedAnimeData(
            animeData.id,
            animeData
          );
          return mappedAnimeData;
        })
      );

      const episodesResults = [];

      const episodesTask = (async () => {
        for (const animeData of response.data.data.Page.media) {
          if (!animeData.idMal) {
            continue;
          }

          const data = await animeEpisodesHelper.getAnimeEpisodesData(
            animeData.idMal,
            animeData.id,
            animeData
          );

          if (data) {
            episodesResults.push(data);
          }

          await delay(1000);
        }
      })();

      const [mappedResults] = await Promise.all([mappingTask, episodesTask]);

      const animeResults = mappedResults.filter(
        (result) => result !== undefined && result !== null
      );

      return { animeResults, episodesResults };
    } catch (error) {
      return await this.handlePageProcessingError(error, page, whichDataToSave);
    }
  }

  async seedAnimeInfo(limit = this.LIMIT) {
    await this.waitForSeedingAvailability();

    try {
      const response = await anilistClient.post("", {
        query: anilistQuery.InfoQueryByPage(1, limit),
      });

      // const totalPages = response?.data?.data?.Page?.pageInfo?.lastPage || 1;
      /*
      At the time of writing this, its seems that the anilist api is not working properly, its not returning the last page, so i have to manually set the total pages and as of 23/11/2024 the last page is 415
      */
      const totalPages = 415;

      for (let page = 1; page <= totalPages; page++) {
        if (APP_CONFIG?.isDevelopment) {
          console.log(`Fetching page ${page} of ${totalPages} for anime info`);
        }

        const animeResultsForCurrentPage = [];
        const episodesResultsForCurrentPage = [];

        const pageProcessingResult = await this.processAnimePage(
          page,
          limit,
          anilistQuery.InfoQueryByPage,
          "anime info"
        );

        if (
          typeof pageProcessingResult === "object" &&
          "errorPage" in pageProcessingResult
        ) {
          page = pageProcessingResult.errorPage;
          continue;
        }

        const { animeResults, episodesResults } = pageProcessingResult;
        animeResultsForCurrentPage.push(...animeResults);

        episodesResults.forEach((episode) => {
          if (
            animeResultsForCurrentPage.some(
              (anime) => anime.idAni === episode.idAni
            )
          ) {
            episodesResultsForCurrentPage.push(episode);
          }
        });

        await animeDBHelper.saveAnimeDataByPage(
          animeResultsForCurrentPage,
          episodesResultsForCurrentPage
        );
      }
    } finally {
      this.isSeedingRunning = false;
    }
  }

  async seedTrendingAnime(totalPages = 1, limit = this.LIMIT) {
    await this.waitForSeedingAvailability();

    try {
      const allAnimeResults = [];
      const allEpisodesResults = [];

      for (let page = 1; page <= totalPages; page++) {
        if (APP_CONFIG?.isDevelopment) {
          console.log(
            `Fetching page ${page} of ${totalPages} for trending anime`
          );
        }

        const pageProcessingResult = await this.processAnimePage(
          page,
          limit,
          anilistQuery.TrendingQuery,
          "trending"
        );

        if (
          typeof pageProcessingResult === "object" &&
          "errorPage" in pageProcessingResult
        ) {
          page = pageProcessingResult.errorPage;
          continue;
        }

        const { animeResults, episodesResults } = pageProcessingResult;
        allAnimeResults.push(...animeResults);

        episodesResults.forEach((episode) => {
          if (allAnimeResults.some((anime) => anime.idAni === episode.idAni)) {
            allEpisodesResults.push(episode);
          }
        });
      }

      await animeDBHelper.saveTrendingAnime(
        allAnimeResults,
        allEpisodesResults
      );
    } finally {
      this.isSeedingRunning = false;
    }
  }

  async seedReleasingAnimeInfoByPage(limit = this.LIMIT) {
    await this.waitForSeedingAvailability();

    try {
      const response = await anilistClient.post("", {
        query: anilistQuery.InfoQueryByStatus(1, limit, "RELEASING"),
      });

      // const totalPages = response?.data?.data?.Page?.pageInfo?.lastPage || 1;
      /*
      At the time of writing this, its seems that the anilist api is not working properly, its not returning the last page, so i have to manually set the total pages for releasing anime and as of 23/11/2024 the last page is 6
      */
      const totalPages = 6;

      for (let page = 1; page <= totalPages; page++) {
        if (APP_CONFIG?.isDevelopment) {
          console.log(
            `Fetching page ${page} of ${totalPages} for releasing anime info`
          );
        }

        const animeResultsForCurrentPage = [];
        const episodesResultsForCurrentPage = [];

        const pageProcessingResult = await this.processAnimePage(
          page,
          limit,
          (p, l) => anilistQuery.InfoQueryByStatus(p, l, "RELEASING"),
          "releasing anime"
        );

        if (
          typeof pageProcessingResult === "object" &&
          "errorPage" in pageProcessingResult
        ) {
          page = pageProcessingResult.errorPage;
          continue;
        }

        const { animeResults, episodesResults } = pageProcessingResult;
        animeResultsForCurrentPage.push(...animeResults);

        episodesResults.forEach((episode) => {
          if (
            animeResultsForCurrentPage.some(
              (anime) => anime.idAni === episode.idAni
            )
          ) {
            episodesResultsForCurrentPage.push(episode);
          }
        });

        await animeDBHelper.saveAnimeDataByPage(
          animeResultsForCurrentPage,
          episodesResultsForCurrentPage
        );
      }
    } finally {
      this.isSeedingRunning = false;
    }
  }

  async handlePageProcessingError(error, page, whichDataToSave) {
    if (APP_CONFIG?.isDevelopment) {
      console.error(
        `Error processing page ${page} for ${whichDataToSave}:`,
        error.message
      );
    }

    // Handle rate limiting
    // This is a temporary solution to avoid rate limit error. because the anilist api's response header's x-ratelimit-remaining is not accurate as per 04/11/2024
    // you can check the anilist api documentation for more information [https://docs.anilist.co/guide/rate-limiting#rate-limiting]

    if (error.response?.status === 429) {
      if (APP_CONFIG?.isDevelopment) {
        console.log("Rate limit exceeded, waiting for 1 minute");
      }
      await delay(1000 * 70);
      return {
        animeResults: [],
        episodesResults: [],
        errorPage: Math.max(page - 1, 1),
      };
    }

    return { animeResults: [], episodesResults: [] };
  }
}

export const animeSeedingHelper = new AnimeSeedingHelper();
