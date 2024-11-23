import { ofetch } from "ofetch";
import { ANIME, META } from "@consumet/extensions";
import { findBestMatch } from "string-similarity";
import { crctAnimeSyncData } from "../constants/index.js";
import { DB_CONFIG } from "../constants/index.js";
import { animeDBHelper } from "./index.js";

class AnimeMappingHelper {
  async getMappedAnimeData(idAni, animeData) {
    try {
      const animeSyncData = await this.getAnimeSyncData(idAni, animeData);

      return {
        idAni,
        animeSyncData: animeSyncData,
        countryOfOrigin: animeData.countryOfOrigin,
        title: animeData.title,
        description: animeData.description,
        coverImage: animeData.coverImage,
        bannerImage: animeData.bannerImage,
        genres: animeData.genres,
        tags: animeData.tags,
        status: animeData.status,
        format: animeData.format,
        episodes: animeData.episodes,
        year: animeData.seasonYear,
        season: animeData.season,
        duration: animeData.duration,
        startIn: animeData.startDate,
        endIn: animeData.endDate,
        nextair: animeData.nextAiringEpisode,
        score: {
          averageScore: animeData.averageScore ? animeData.averageScore : 0,
          decimalScore: animeData.averageScore
            ? animeData.averageScore / 10
            : 0,
        },
        popularity: animeData.popularity,
        siteUrl: animeData.siteUrl,
        trailer: animeData.trailer,
        studios: animeData.studios.nodes,
        isAdult: animeData.isAdult,
        airingSchedule: animeData.airingSchedule?.nodes,
      };
    } catch (error) {
      return null;
    }
  }

  async getAnimeSyncData(idAni, animeData) {
    if (DB_CONFIG?.isEnabled) {
      const animeSyncData = await animeDBHelper.getAnimeSyncInfo(
        "idAni",
        idAni
      );
      if (animeSyncData) {
        return animeSyncData;
      }
    }

    let animeSyncRawJsonData = await this.tryMultipleSources(idAni, animeData);

    const fribbAnimeSyncRawJsonData = await this.fetchAnimeSyncRawJsonData(
      `https://api.animesage.online/files/animeSyncRawJsonData/fribb-anime-lists/${idAni}.json`
    );

    return this.getIDeachProvider(
      idAni,
      animeSyncRawJsonData,
      animeData,
      fribbAnimeSyncRawJsonData
    );
  }

  async tryMultipleSources(idAni, animeData) {
    const sources = [
      `https://api.animesage.online/files/animeSyncRawJsonData/bal-mackup-mal-backup/${idAni}.json`,
      `https://raw.githubusercontent.com/bal-mackup/mal-backup/master/anilist/anime/${idAni}.json`,
      `https://api.malsync.moe/mal/anime/anilist:${idAni}`,
    ];

    for (const source of sources) {
      const data = await this.fetchAnimeSyncRawJsonData(source);
      if (this.isValidData(data)) {
        return data;
      }
    }

    return this.fetchFromConsumet(idAni, animeData);
  }

  async fetchFromConsumet(idAni, animeData) {
    const gogo = new ANIME.Gogoanime();
    const mal = new META.Myanimelist();
    const primaryTitle = animeData.title?.romaji || animeData.title?.english;

    const gogoDataSub = await this.fetchProviderData(primaryTitle, "", gogo);
    if (!gogoDataSub) {
      return null;
    }

    const gogoDataDub = await this.fetchProviderData(
      primaryTitle,
      " (Dub)",
      gogo
    );

    const malID = animeData.idMal || (await this.getMalID(gogoDataSub, mal));

    const syncData = {
      idAni,
      title: primaryTitle,
      malId: malID,
      Sites: {
        Gogoanime: {
          [gogoDataSub.identifier]: gogoDataSub,
          ...(gogoDataDub ? { [gogoDataDub.identifier]: gogoDataDub } : {}),
        },
      },
    };

    return syncData;
  }

  async fetchProviderData(title, suffix = "", provider) {
    try {
      const titleWithSuffix = title + suffix;

      const searchResults = await provider.search(titleWithSuffix);
      if (searchResults?.results?.length === 0) {
        return null;
      }

      const resultTitles = searchResults.results.map((r) => r.title);

      const bestMatch = findBestMatch(titleWithSuffix, resultTitles).bestMatch
        .target;

      const bestResult = searchResults.results.find(
        (r) => r.title === bestMatch
      );

      if (bestResult.title.toLowerCase() !== titleWithSuffix.toLowerCase()) {
        return null;
      }

      return bestResult
        ? {
            identifier: bestResult.id,
            image: bestResult.image,
            page: "Gogoanime",
            title: bestResult.title,
            url: bestResult.url,
          }
        : null;
    } catch (error) {
      return null;
    }
  }

  async getMalID(gogoDataSub, mal) {
    try {
      const searchResults = await mal.search(gogoDataSub.identifier);
      if (searchResults?.results?.length === 0) {
        return null;
      }

      const resultTitles = searchResults.results.map((r) => r.title);
      const bestMatch = findBestMatch(gogoDataSub.identifier, resultTitles)
        .bestMatch.target;
      const bestResult = searchResults.results.find(
        (r) => r.title === bestMatch
      );

      return bestResult?.id;
    } catch (error) {
      return null;
    }
  }

  getIDeachProvider(idAni, json, animeData, fribbAnimeSyncRawJsonData) {
    let idGogo = null;
    let idGogoDub = null;
    let idZoro = null;
    let idPahe = null;
    const idNotifyMoe = fribbAnimeSyncRawJsonData?.notify_moe_id || null;
    const idKitsu = fribbAnimeSyncRawJsonData?.kitsu_id || null;
    const idAnidb = fribbAnimeSyncRawJsonData?.anidb_id || null;
    const idAnimePlanet = fribbAnimeSyncRawJsonData?.anime_planet_id || null;
    const idLivechart = fribbAnimeSyncRawJsonData?.livechart_id || null;
    const idAnisearch = fribbAnimeSyncRawJsonData?.anisearch_id || null;

    if (!json || !json.Sites) {
      return {
        idAni: idAni,
        idMal: animeData?.idMal || fribbAnimeSyncRawJsonData?.mal_id || null,
        idGogo: null,
        idGogoDub: null,
        idZoro: null,
        idPahe: null,
        idNotifyMoe: idNotifyMoe,
        idKitsu: idKitsu,
        idAnidb: idAnidb,
        idAnimePlanet: idAnimePlanet,
        idLivechart: idLivechart,
        idAnisearch: idAnisearch,
      };
    }

    for (const [animePage, animeInfo] of Object.entries(json.Sites)) {
      if (animePage === "Gogoanime") {
        for (const [key, anime] of Object.entries(animeInfo)) {
          const isDub =
            key.toLowerCase().includes("-dub") ||
            anime?.title?.toLowerCase().includes("(dub)");
          if (isDub) {
            idGogoDub = anime?.identifier;
          } else if (!idGogo) {
            idGogo = anime?.identifier;
          }
        }
      } else if (animePage === "Zoro") {
        idZoro = this.extractZoroId(Object.values(animeInfo)[0]?.url);
      } else if (animePage === "animepahe") {
        idPahe = Object.values(animeInfo)[0]?.identifier || null;
      }
    }

    const existingData = crctAnimeSyncData().find(
      (item) => item?.idAni === idAni
    );

    if (existingData) {
      return {
        idAni: existingData.idAni,
        idMal: existingData.idMal,
        idGogo: existingData.idGogo,
        idGogoDub: existingData.idGogoDub,
        idZoro: existingData.idZoro,
        idPahe: existingData.idPahe,
        idNotifyMoe: existingData.idNotifyMoe,
        idKitsu: existingData.idKitsu,
        idAnidb: existingData.idAnidb,
        idAnimePlanet: existingData.idAnimePlanet,
        idLivechart: existingData.idLivechart,
        idAnisearch: existingData.idAnisearch,
      };
    }

    return {
      idAni,
      idMal:
        animeData?.idMal ||
        json?.malId ||
        fribbAnimeSyncRawJsonData?.mal_id ||
        null,
      idGogo,
      idGogoDub,
      idZoro,
      idPahe,
      idNotifyMoe,
      idKitsu,
      idAnidb,
      idAnimePlanet,
      idLivechart,
      idAnisearch,
    };
  }

  async fetchAnimeSyncRawJsonData(url) {
    try {
      return await ofetch(url, {
        cache: "force-cache",
        responseType: "json",
      });
    } catch {
      return null;
    }
  }

  isValidData(data) {
    if (!data || data === "404: Not Found") {
      return false;
    }

    if (data.name === "EntityNotFoundError" && data.code === 404) {
      return false;
    }

    return data.Sites?.Gogoanime != null;
  }

  extractZoroId(url) {
    return url.includes("https://zoro.to/")
      ? url.replace("https://zoro.to/", "")
      : url.includes("https://hianime.to/")
      ? url.replace("https://hianime.to/", "")
      : url.includes("https://aniwatch.to/")
      ? url.replace("https://aniwatch.to/", "")
      : null;
  }
}

export const animeMappingHelper = new AnimeMappingHelper();
