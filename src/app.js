import express, { json, urlencoded } from "express";
import morgan from "morgan";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import { errorHandler } from "./v1/middleware/index.js";
import {
  accessLogger,
  errorLogger,
} from "./v1/middleware/logger.middleware.js";
import {
  APP_CONFIG,
  SENTRY_CONFIG,
  APP_CONSTANTS,
} from "./v1/constants/constants.js";
import v1Routes from "./v1/routes/index.js";
import { AppErrorTypes } from "./v1/utils/appError.js";
import { fileURLToPath } from "url";
import favicon from "serve-favicon";
import path from "path";
import { dirname } from "path";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Basic middleware
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
  })
);
app.use(json());
app.use(urlencoded({ extended: true }));
app.set("trust proxy", 1);

// Add logger middleware early in the chain
app.use(accessLogger);

// Sentry Configuration
if (SENTRY_CONFIG.isEnabled) {
  Sentry.init({
    environment: APP_CONFIG.environment,
    dsn: SENTRY_CONFIG.dsn,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],
    tracesSampleRate: 0,
    sampleRate: 0.1,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Root route
app.get("/", (req, res) => {
  res.json({
    message: APP_CONSTANTS.rootMessage,
    ...(APP_CONSTANTS.rootNote && { note: APP_CONSTANTS.rootNote }),
    author: {
      name: "Animesage",
      url: "https://github.com/animesage-online",
      email: APP_CONSTANTS.contactEmail,
    },
    repository: {
      type: "git",
      url: "https://github.com/animesage-online/animesage-api",
    },
    docs: APP_CONSTANTS.docsUrl,
    versions: APP_CONSTANTS.rootVersions,
    endpoints: {
      v1: "/v1",
    },
  });
});

app.use(favicon(path.join(__dirname, "../public/assets", "favicon.ico")));

// API routes
app.use("/v1", v1Routes);

// Invalid route handling
app.use((req, res, next) => {
  next(AppErrorTypes.ROUTE.INVALID_ROUTE(req.originalUrl));
});

// Error handling chain
if (SENTRY_CONFIG.isEnabled) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use(errorLogger);
app.use(errorHandler);

export default app;
