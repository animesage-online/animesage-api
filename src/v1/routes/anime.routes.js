import { Router } from "express";
import { animeController } from "../controllers/index.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    statusCode: 200,
    message: "Available Anime Endpoints",
    endpoints:
      "Please refer to the documentation for the available endpoints. [Animesage-DOCS](https://docs.animesage.online/)",
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

// These routes will be deprecated soon
router.get("/info/:provider/:animeId", animeController.getAnimeById);

export default router;
