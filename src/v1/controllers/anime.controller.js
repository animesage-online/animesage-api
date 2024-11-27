import { catchAsync } from "../utils/catchAsync.js";
import { animeService } from "../services/index.js";
import { DB_CONFIG } from "../constants/constants.js";
import {
  successResponse,
  paginatedSuccessResponse,
} from "../utils/response.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const DEFAULT_PROVIDER = "anilist";
const DEFAULT_TYPE = "sub";

const handlePaginatedResponse = (res, data, note = null) =>
  res
    .status(data.statusCode)
    .json(
      paginatedSuccessResponse(
        data.statusCode,
        data.message,
        data.results,
        data.pagination,
        note
      )
    );

const handleStandardResponse = (res, data, note = null) =>
  res
    .status(data.statusCode)
    .json(successResponse(data.statusCode, data.message, data.results, note));

export const getAnimeById = catchAsync(async (req, res) => {
  const { animeId } = req.params;
  const provider =
    req.query.provider || req.params.provider || DEFAULT_PROVIDER;

  const isDeprecatedMethod = Boolean(req.params.provider);
  const note = isDeprecatedMethod
    ? "This method will be deprecated soon. Please use the new method with query parameter `provider`. Refer to the documentation for more details."
    : null;

  const data = await animeService.getAnimeInfo(animeId, provider);
  handleStandardResponse(res, data, note);
});

export const getEpisodesByAnimeId = catchAsync(async (req, res) => {
  const { animeId } = req.params;
  const { provider = DEFAULT_PROVIDER } = req.query;

  const data = await animeService.getEpisodesInfoByAnimeId(animeId, provider);
  handleStandardResponse(res, data);
});

export const searchAnimeByTitle = catchAsync(async (req, res) => {
  const { title } = req.params;
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;

  const data = await animeService.searchAnimeByTitle(title, page, limit);
  handlePaginatedResponse(res, data);
});

export const getTrendingAnime = catchAsync(async (req, res) => {
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;

  const data = await animeService.getTrendingAnimeInfo(page, limit);

  handlePaginatedResponse(res, data);
});

export const getPopularAnime = catchAsync(async (req, res) => {
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;

  const data = await animeService.getPopularAnimeInfo(page, limit);

  handlePaginatedResponse(res, data);
});

export const getAnimeByPage = catchAsync(async (req, res) => {
  const { page = DEFAULT_PAGE } = req.params;
  const { limit = DEFAULT_LIMIT, year, season } = req.query;

  const data = await animeService.getAnimeByPage(page, limit, year, season);

  const note = DB_CONFIG?.isEnabled
    ? "Results are fetched from cached database. New or uncached anime may not appear."
    : null;

  handlePaginatedResponse(res, data, note);
});

export const getStreamingLink = catchAsync(async (req, res) => {
  const { animeId, episodeNumber } = req.params;
  let { type = DEFAULT_TYPE, provider = DEFAULT_PROVIDER } = req.query;

  if (provider === "gogo") {
    const isDub = animeId.toLowerCase().includes("-dub");
    type = isDub ? "dub" : "sub";
  }

  const data = await animeService.getStreamingInfo(
    animeId,
    episodeNumber,
    provider,
    type
  );

  const note =
    "If you are having some issues with the `streamSources`, please use the `embedSources`.";

  handleStandardResponse(res, data, note);
});

export const getRandomAnime = catchAsync(async (req, res) => {
  const data = await animeService.getRandomAnimeInfo();

  handleStandardResponse(res, data);
});

export const getLatestAiringAnime = catchAsync(async (req, res) => {
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;

  const data = await animeService.getLatestAiringAnime(page, limit);
  handlePaginatedResponse(res, data);
});

export const animeController = {
  getAnimeById,
  getEpisodesByAnimeId,
  getAnimeByPage,
  searchAnimeByTitle,
  getTrendingAnime,
  getPopularAnime,
  getStreamingLink,
  getRandomAnime,
  getLatestAiringAnime,
};
