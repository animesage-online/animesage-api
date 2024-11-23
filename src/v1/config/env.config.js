import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Environment Variables Schema
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("production"),
  RATE_LIMIT: z.string().default("30"),
  ALLOWED_ORIGINS: z.string().default("*"),
  SENTRY_DNS_URL: z.optional(z.string()),
  BLOCK_WITH_CORS: z.enum(["true", "false"]).default("false"),
  PORT: z
    .string()
    .default("4646")
    .transform((val) => parseInt(val, 10)),
  GOGOANIME_URL: z.string().default("https://anitaku.bz/"),
  GOGOANIME_URL2: z.string().default("https://gogoanime3.co/"),
  ZORO_URL: z.string().default("https://hianime.to/"),
  GOGO_AJAX_URL: z.string().default("https://ajax.gogocdn.net/"),
  ANILIST_API_URL: z.string().default("https://graphql.anilist.co"),
  JIKAN_API_URL: z.string().default("https://api.jikan.moe/v4"),
  DOCS_URL: z.string().default("https://docs.animesage.online"),
  CONTACT_EMAIL: z.optional(z.string()),
  IS_USE_MYSQL: z.enum(["true", "false"]).default("false"),
  MYSQL_HOSTNAME: z.optional(z.string()),
  MYSQL_USERNAME: z.optional(z.string()),
  MYSQL_PASSWORD: z.optional(z.string()),
  MYSQL_DATABASE: z.optional(z.string()),
  APP_ROOT_MESSAGE: z.optional(z.string()),
  APP_ROOT_NOTE: z.optional(z.string()),
  BURST_MAX: z.string().default("20"),
});

export const env = envSchema.safeParse(process.env);
