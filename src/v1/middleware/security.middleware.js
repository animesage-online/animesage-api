import rateLimit from "express-rate-limit";
import cors from "cors";
import { APP_CONFIG } from "../constants/constants.js";
import { AppErrorTypes } from "../utils/appError.js";

const burstWindow = new Map();
const BURST_MAX = APP_CONFIG?.burstMax || 20;
const BURST_WINDOW = 1000;

const getClientIP = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip;
};

const createRateLimiter = (windowMs, max) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIP(req),
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        statusCode: 429,
        message: "Too many requests, please try again later",
        retryAfter: Math.ceil(windowMs / 1000) + " seconds",
        docs: APP_CONFIG?.docsUrl,
      });
    },
  });

export const burstLimiter = (req, res, next) => {
  const clientIP = getClientIP(req);
  const now = Date.now();

  if (!burstWindow.has(clientIP)) {
    burstWindow.set(clientIP, []);
  }

  const clientRequests = burstWindow.get(clientIP);

  while (clientRequests.length && clientRequests[0] < now - BURST_WINDOW) {
    clientRequests.shift();
  }

  if (clientRequests.length >= BURST_MAX) {
    return res.status(429).json({
      success: false,
      statusCode: 429,
      message: "Burst limit exceeded, please slow down",
      retryAfter: "1 second",
      docs: APP_CONFIG?.docsUrl,
    });
  }

  clientRequests.push(now);
  burstWindow.set(clientIP, clientRequests);

  if (Math.random() < 0.1) {
    const cleanupTime = now - BURST_WINDOW;
    for (const [ip, timestamps] of burstWindow.entries()) {
      if (
        !timestamps.length ||
        timestamps[timestamps.length - 1] < cleanupTime
      ) {
        burstWindow.delete(ip);
      }
    }
  }

  next();
};

export const limiter = createRateLimiter(60 * 1000, APP_CONFIG?.rateLimit);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!APP_CONFIG.blockWithCors) {
      return callback(null, true);
    }

    if (APP_CONFIG.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppErrorTypes.API.FORBIDDEN());
    }
  },
  exposedHeaders: [
    "x-animesage-api-trueIP",
    "x-animesage-api-trueHost",
    "x-animesage-api-trueUA",
    "x-animesage-api-info",
    "x-animesage-api-cache",
    "x-animesage-api-cache-time",
    "x-cache-timestamp",
    "x-cache-ttl",
  ],
  credentials: true,
  maxAge: 86400,
});

export const checkDomain = (req, res, next) => {
  const origin = req.get("origin") || req.get("host");
  const clientIP = getClientIP(req);

  res.setHeader("x-animesage-api-trueIP", clientIP);
  res.setHeader("x-animesage-api-trueHost", req.headers.referer || "");
  res.setHeader("x-animesage-api-trueUA", req.headers["user-agent"] || "");
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("x-frame-options", "DENY");
  res.setHeader("x-xss-protection", "1; mode=block");
  res.setHeader(
    "strict-transport-security",
    "max-age=31536000; includeSubDomains"
  );

  if (!APP_CONFIG?.blockWithCors) {
    res.setHeader("x-animesage-api-info", "allowed");
    return next();
  }

  if (!APP_CONFIG?.allowedOrigins.includes(origin)) {
    res.setHeader("x-animesage-api-info", "blocked");
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: "Access forbidden",
      docs: APP_CONFIG?.docsUrl,
    });
  }

  res.setHeader("x-animesage-api-info", "allowed");
  next();
};
