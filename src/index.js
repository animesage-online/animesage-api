import app from "./app.js";
import { APP_CONFIG, DB_CONFIG } from "./v1/constants/constants.js";
import { animeSeedingHelper } from "./v1/helpers/anime.seeding.helper.js";
import { db } from "./v1/config/index.js";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    const server = app.listen(APP_CONFIG.port, () => {
      console.log(`Environment: ${APP_CONFIG.environment}`);
      console.log(`Database: ${DB_CONFIG.isEnabled ? "MySQL" : "NO Database"}`);
      console.log(`Server running on port: ${APP_CONFIG.port}`);
      if (APP_CONFIG.isDevelopment) {
        console.log(`Access the API at http://localhost:${APP_CONFIG.port}`);
      }
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      if (db.pool) {
        await db.pool.end();
        console.log("MySQL connection pool closed.");
      }
      server.close(() => {
        console.log("Animesage-API closed");
        process.exit(0);
      });

      setTimeout(() => {
        console.error(
          "Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    await animeSeedingHelper.seedAnimeDataInDB();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
