import { env } from "../config/env.config.js";
import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync("./package.json"));

// API URLs
export const ANILIST_API_URL = env.data.ANILIST_API_URL;
export const JIKAN_API_URL = env.data.JIKAN_API_URL;
export const ZORO_URL = env.data.ZORO_URL;
export const GOGO_URLS = {
  BASE_URL: env.data.GOGOANIME_URL,
  BASE_URL2: env.data.GOGOANIME_URL2,
  AJAX_URL: env.data.GOGO_AJAX_URL,
};

// Database Config
export const DB_CONFIG = {
  isEnabled: env.data.IS_USE_MYSQL === "true",
  host: env.data.MYSQL_HOSTNAME,
  user: env.data.MYSQL_USERNAME,
  password: env.data.MYSQL_PASSWORD,
  database: env.data.MYSQL_DATABASE,
};

// App Configuration
export const APP_CONFIG = {
  port: env.data.PORT,
  environment: env.data.NODE_ENV,
  isDevelopment: env.data.NODE_ENV === "development",
  rateLimit: parseInt(env.data.RATE_LIMIT, 10),
  burstMax: parseInt(env.data.BURST_MAX, 10),
  blockWithCors: env.data.BLOCK_WITH_CORS === "true",
  allowedOrigins: env.data.ALLOWED_ORIGINS.split(","),
  isUseCronJob: env.data.IS_USE_CRON_JOB === "true",
};

// APP constants
export const APP_CONSTANTS = {
  rootMessage: env.data.APP_ROOT_MESSAGE,
  rootNote: env.data.APP_ROOT_NOTE,
  rootVersions: pkg.version || "0.0.0",
  docsUrl: env.data.DOCS_URL,
  contactEmail: env.data.CONTACT_EMAIL,
};

// Sentry
export const SENTRY_CONFIG = {
  dns: env.data.SENTRY_DNS_URL,
  isEnabled: env.data.SENTRY_DNS_URL !== "",
};

// User Agent
export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36";

export const constants = {
  ANILIST_API_URL,
  JIKAN_API_URL,
  GOGO_URLS,
  ZORO_URL,
  DB_CONFIG,
  APP_CONFIG,
  APP_CONSTANTS,
  SENTRY_CONFIG,
};
