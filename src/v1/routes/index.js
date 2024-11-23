import { Router } from "express";
import { APP_CONFIG, APP_CONSTANTS } from "../constants/constants.js";
import {
  checkDomain,
  limiter,
  burstLimiter,
  corsMiddleware,
} from "../middleware/security.middleware.js";
import animeRoutes from "./anime.routes.js";
import { animeCron } from "../cron/anime.cron.js";
import { animeSeedingHelper } from "../helpers/anime.seeding.helper.js";

const router = Router();

// Security middleware chain
router.use(corsMiddleware);
router.use(checkDomain);

// Version headers
router.use((req, res, next) => {
  res.setHeader("x-animesage-api-version", APP_CONSTANTS.rootVersions);
  next();
});

// Rate limiting middleware - Apply burst limiter first, then regular limiter
router.use(burstLimiter);
router.use(limiter);

// V1 Welcome route
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to Animesage API v1",
    rateLimit: `${APP_CONFIG?.rateLimit} requests per minute`,
    endpoints: {
      anime: "/anime",
    },
  });
});

// Routes
router.use("/anime", animeRoutes);

// Cron jobs
animeCron.everyDay(() => animeSeedingHelper.seedTrendingAnime());
animeCron.everyMonth(() => animeSeedingHelper.seedAnimeInfo());
animeCron.everySeventeenMinute(() =>
  animeSeedingHelper.seedReleasingAnimeInfoByPage()
);

export default router;
