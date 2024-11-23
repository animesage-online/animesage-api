import mysql from "mysql2";
import { AppErrorTypes } from "../utils/appError.js";
import { DB_CONFIG } from "../constants/constants.js";

let pool = null;

if (DB_CONFIG.isEnabled) {
  // Check if MySQL host and database are configured
  if (!DB_CONFIG?.host || !DB_CONFIG?.database) {
    throw AppErrorTypes.DATABASE.MYSQL_NOT_CONFIGURED();
  }

  // Create MySQL pool
  pool = mysql
    .createPool({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      maxIdle: 5,
      idleTimeout: 5 * 60 * 1000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    })
    .promise();
}

export const db = {
  pool,
};
