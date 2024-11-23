import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, "../../../logs");
const ACCESS_LOG = path.join(LOG_DIR, "access.log");
const ERROR_LOG = path.join(LOG_DIR, "error.log");

const logBuffer = {
  access: [],
  error: [],
};

const BUFFER_SIZE = 10;
const FLUSH_INTERVAL = 5000;

const ensureLogDirectory = () => {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("Failed to create log directory:", err);
  }
};

const formatAccessLogEntry = (req, res, responseTime) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.headers["x-forwarded-for"] || req.ip;

  return (
    JSON.stringify(
      {
        timestamp,
        ip: clientIP,
        method: req.method,
        path: req.originalUrl,
        params: req.params,
        query: req.query,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.headers["user-agent"] || "Unknown",
        referer: req.headers.referer || "-",
      },
      null,
      2
    ) + "\n"
  );
};

const formatErrorLogEntry = (req, res, error, responseTime) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.headers["x-forwarded-for"] || req.ip;

  return (
    JSON.stringify(
      {
        timestamp,
        ip: clientIP,
        method: req.method,
        path: req.originalUrl,
        params: req.params,
        query: req.query,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code,
          type: error.type || "UnknownError",
          isOperational: error.isOperational,
        },
        request: {
          headers: req.headers,
          body: req.body,
        },
      },
      null,
      2
    ) + "\n"
  );
};

const flushLogs = async (type = "access") => {
  const buffer = logBuffer[type];
  const logFile = type === "access" ? ACCESS_LOG : ERROR_LOG;

  if (buffer.length > 0) {
    try {
      await fs.promises.appendFile(logFile, buffer.join(""));
      buffer.length = 0;
    } catch (err) {
      console.error(`Error writing to ${type} log:`, err);

      try {
        const fallbackLog = path.join(process.cwd(), `${type}.log`);
        await fs.promises.appendFile(fallbackLog, buffer.join(""));
        buffer.length = 0;
      } catch (fallbackErr) {
        console.error("Failed to write to fallback log:", fallbackErr);
      }
    }
  }
};

setInterval(() => {
  flushLogs("access").catch(console.error);
  flushLogs("error").catch(console.error);
}, FLUSH_INTERVAL);

export const accessLogger = (req, res, next) => {
  if (req.originalUrl === "/favicon.ico") {
    return next();
  }

  const startTime = process.hrtime();

  ensureLogDirectory();

  res.on("finish", () => {
    if (res.statusCode < 400) {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const responseTime = Math.round(seconds * 1000 + nanoseconds / 1000000);

      const accessLogEntry = formatAccessLogEntry(req, res, responseTime);
      logBuffer.access.push(accessLogEntry);

      if (logBuffer.access.length >= BUFFER_SIZE) {
        flushLogs("access").catch(console.error);
      }
    }
  });

  next();
};

export const errorLogger = (err, req, res, next) => {
  if (req.originalUrl === "/favicon.ico") {
    return next(err);
  }

  const [seconds, nanoseconds] = process.hrtime();
  const responseTime = Math.round(seconds * 1000 + nanoseconds / 1000000);

  const errorLogEntry = formatErrorLogEntry(req, res, err, responseTime);
  logBuffer.error.push(errorLogEntry);

  if (logBuffer.error.length >= BUFFER_SIZE) {
    flushLogs("error").catch(console.error);
  }

  next(err);
};

process.on("SIGTERM", async () => {
  try {
    await Promise.all([flushLogs("access"), flushLogs("error")]);
  } catch (err) {
    console.error("Error flushing logs on shutdown:", err);
  }
});

process.on("SIGINT", async () => {
  try {
    await Promise.all([flushLogs("access"), flushLogs("error")]);
  } catch (err) {
    console.error("Error flushing logs on shutdown:", err);
  }
});
