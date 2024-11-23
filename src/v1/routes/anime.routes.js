import { Router } from "express";
import { animeController } from "../controllers/index.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    statusCode: 200,
    message: "Available Anime Endpoints",
    endpoints:
      "Please check out our github repo for the available endpoints. [Animesage-API](https://github.com/animesage-online/animesage-api)",
  });
});

router.get("/:animeId/info", animeController.getAnimeById);
router.get("/:animeId/episodes", animeController.getEpisodesByAnimeId);
router.get("/info/page/:page", animeController.getAnimeByPage);
router.get("/search-by-title/:title", animeController.searchAnimeByTitle);
router.get("/trending", animeController.getTrendingAnime);
router.get("/popular", animeController.getPopularAnime);
router.get("/:animeId/stream/:episodeNumber", animeController.getStreamingLink);
router.get("/random", animeController.getRandomAnime);
router.get("/latest-anime", animeController.getLatestAiringAnime);

export default router;
