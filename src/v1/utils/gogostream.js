// CODE FROM CONSUMET.TS WITH MODIFICATION CHANGES
// Repository Link: https://github.com/consumet/consumet.ts/blob/master/src/providers/anime/gogoanime.ts
// Thanks to @consumet for the code

import axios from "axios";
import { load } from "cheerio";
import CryptoJS from "crypto-js";
import { GOGO_URLS, USER_AGENT } from "../constants/constants.js";
import { handleErrorInApiFunctions } from "./errorUtils.js";

const keys = {
  key: CryptoJS.enc.Utf8.parse("37911490979715163134003223491201"),
  secondKey: CryptoJS.enc.Utf8.parse("54674138327930866480207815084989"),
  iv: CryptoJS.enc.Utf8.parse("3134003223491201"),
};

export const extractStreamData = async (idWithEpisode) => {
  try {
    let datapageData;
    const datapage = await axios.get(`${GOGO_URLS.BASE_URL}` + idWithEpisode, {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    datapageData = datapage.data;

    const x$ = load(datapageData);
    const title = x$(".anime_video_body_cate > .anime-info > a").attr("title");
    const anime_id = x$(".anime_video_body_cate > .anime-info > a")
      .attr("href")
      .replace("/category/", "");
    const downloadUrl = x$("li.dowloads a").attr("href");
    const vidstreamingIframeUrl = x$("li.anime > a").attr("data-video");

    const isDub = idWithEpisode.includes("-dub-");
    const modifiedDownloadUrl = downloadUrl.replace("Gogoanime", "AnimeSage");
    const modifiedVidstreamingIframeUrl =
      vidstreamingIframeUrl + `&typesub=AnimeSage-${isDub ? "DUB" : "SUB"}`;

    const server = x$("#load_anime > div > div > iframe").attr("src");
    const serverUrl = new URL(server);

    const serverPage = await axios.get(serverUrl.href, {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    const $ = load(serverPage.data);

    const embedSources = [];
    const liElements = $("#list-server-more > ul > li");

    liElements.each((index, element) => {
      const videoUrl = $(element).attr("data-video");
      const name = $(element).text();

      if (name === "Multiquality Server") {
        return; // Skip Multiquality Server
      }

      embedSources.push({
        name: name,
        url: name === "Vidstreaming" ? modifiedVidstreamingIframeUrl : videoUrl,
      });
    });

    const encyptedParams = await generateEncryptedAjaxParams(
      $,
      serverUrl.searchParams.get("id") ?? ""
    );

    const encryptedData = await axios.get(
      `${serverUrl.protocol}//${serverUrl.hostname}/encrypt-ajax.php?${encyptedParams}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    const decryptedData = await decryptAjaxData(encryptedData.data.data);
    let streamSources = [];

    if (
      decryptedData &&
      decryptedData !== null &&
      decryptedData !== undefined
    ) {
      if (
        decryptedData.source !== null &&
        decryptedData.source !== undefined &&
        decryptedData.source !== ""
      ) {
        decryptedData.source.forEach((source) => {
          streamSources.push({
            url: source.file,
            label: source.label,
            isM3U8: source.file.includes(".m3u8"),
            type: "default",
          });
        });
      }

      if (
        decryptedData.source_bk !== null &&
        decryptedData.source_bk !== undefined &&
        decryptedData.source_bk !== ""
      ) {
        decryptedData.source_bk.forEach((source) => {
          streamSources.push({
            url: source.file,
            label: source.label,
            isM3U8: source.file.includes(".m3u8"),
            type: "backup",
          });
        });
      }
    }

    return {
      info: {
        title,
        gogoId: anime_id,
        episode: idWithEpisode.split("-episode-")[1],
      },
      streamSources: streamSources,
      embedSources: embedSources,
      download: modifiedDownloadUrl,
    };
  } catch (error) {
    handleErrorInApiFunctions(error, "GogoStream.extractStreamData");
  }
};

export const generateEncryptedAjaxParams = async ($, id) => {
  const encryptedKey = CryptoJS.AES.encrypt(id, keys.key, {
    iv: keys.iv,
  });
  const scriptValue = $("script[data-name='episode']").data().value;
  const decryptedToken = CryptoJS.AES.decrypt(scriptValue, keys.key, {
    iv: keys.iv,
  }).toString(CryptoJS.enc.Utf8);
  return `id=${encryptedKey}&alias=${id}&${decryptedToken}`;
};

export const decryptAjaxData = async (encryptedData) => {
  const decryptedData = CryptoJS.enc.Utf8.stringify(
    CryptoJS.AES.decrypt(encryptedData, keys.secondKey, {
      iv: keys.iv,
    })
  );

  return JSON.parse(decryptedData);
};

export const gogoStream = {
  extractStreamData,
  generateEncryptedAjaxParams,
  decryptAjaxData,
};
