import CryptoJS from "crypto-js";
import { gogoStream } from "../utils/gogostream.js";
import { handleErrorInApiFunctions } from "../utils/errorUtils.js";
import { AppErrorTypes } from "../utils/appError.js";
import { JIKAN_API_URL } from "../constants/constants.js";
import { delay } from "../utils/delayUtils.js";
import { APP_CONFIG } from "../constants/constants.js";
import axios from "axios";

class AnimeEpisodesHelper {
  base64encode(string) {
    const encodedWord = CryptoJS.enc.Utf8.parse(string);
    const encoded = CryptoJS.enc.Base64.stringify(encodedWord);
    return encoded;
  }

  isVideoAvailable(data) {
    if (!data) {
      return false;
    }
    return data.code === 404 ? false : data.code === 500 ? false : true;
  }

  // Here id means, gogoanime id
  async getAnimeStreamData(id, episodeNumber) {
    try {
      if (!id) {
        throw AppErrorTypes.API.INVALID_REQUEST();
      }

      const idWithEpisode = `${id}-episode-${episodeNumber}`;
      const streamData = await gogoStream.extractStreamData(idWithEpisode);

      if (!this.isVideoAvailable(streamData)) {
        return null;
      }

      const mainStream = streamData.streamSources
        ? streamData.streamSources.find((item) => item.type === "default")
        : null;

      const backupStream = streamData.streamSources
        ? streamData.streamSources.find((item) => item.type === "backup")
        : null;

      return {
        info: streamData.info ? streamData.info : null,
        streamSources: {
          main: mainStream ? mainStream : null,
          backup: backupStream ? backupStream : null,
        },
        embedSources: streamData.embedSources ? streamData.embedSources : [],
        download: streamData.download === null ? null : streamData.download,
      };
    } catch (error) {
      handleErrorInApiFunctions(
        error,
        "AnimeEpisodesHelper.getAnimeStreamData"
      );
    }
  }

  async getAnimeEpisodesData(idMal, idAni, animeData) {
    try {
      const response = await axios.get(
        `${JIKAN_API_URL}/anime/${idMal}/episodes`
      );

      const episodesData = [];
      const totalPages = response?.data?.pagination?.last_visible_page || 1;

      response?.data?.data?.map((episode) => {
        episodesData.push({
          episodeNumber: episode?.mal_id,
          title_en: episode?.title,
          title_romaji: episode?.title_romanji,
          aired: episode?.aired,
        });
      });

      // Fetch episodes from other pages if available
      for (let page = 2; page <= totalPages; page++) {
        await delay(1000);

        const response = await axios.get(
          `${JIKAN_API_URL}/anime/${idMal}/episodes?page=${page}`
        );
        response?.data?.data?.forEach((episode) => {
          episodesData.push({
            episodeNumber: episode?.mal_id,
            title_en: episode?.title,
            title_romaji: episode?.title_romanji,
            aired: episode?.aired,
          });
        });
      }

      return {
        idAni: idAni,
        title: animeData?.title,
        episodesData: episodesData,
      };
    } catch (error) {
      if (
        error?.response?.status === 500 &&
        error?.response?.type === "UpstreamException" &&
        error?.response?.message ===
          "Request to MyAnimeList.net timed out (10 seconds). Please try again later."
      ) {
        if (APP_CONFIG?.isDevelopment) {
          console.log(
            `MyAnimeList.net timed out for idMal: ${idMal}, retrying in 11 seconds...`
          );
        }
        await delay(1000 * 11);
        return await this.getAnimeEpisodesData(idMal, idAni, animeData);
      }
      handleErrorInApiFunctions(
        error,
        "AnimeEpisodesHelper.getAnimeEpisodesData"
      );
    }
  }
}

export const animeEpisodesHelper = new AnimeEpisodesHelper();
