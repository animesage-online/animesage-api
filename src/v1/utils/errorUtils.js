import { AppError, AppErrorTypes } from "./appError.js";
import { APP_CONFIG } from "../constants/constants.js";

export const handleErrorInApiFunctions = (error, context = "") => {
  if (error instanceof AppError) {
    throw error;
  }

  if (APP_CONFIG?.isDevelopment) {
    console.error(`Error in ${context}:`, error);
  }

  if (error.response) {
    switch (error.response.status) {
      case 404:
        throw AppErrorTypes.API.RESOURCE_NOT_FOUND();
      case 429:
        throw AppErrorTypes.EXTERNAL_API.RATE_LIMIT();
      case 500:
      case 502:
      case 503:
        throw AppErrorTypes.EXTERNAL_API.FETCH_FAILED(
          "External service is currently unavailable"
        );
      default:
        throw AppErrorTypes.EXTERNAL_API.FETCH_FAILED();
    }
  }

  if (error.code === "ECONNREFUSED" || error.code === "ECONNRESET") {
    throw AppErrorTypes.EXTERNAL_API.FETCH_FAILED(
      "Unable to connect to external service"
    );
  }

  throw AppErrorTypes.EXTERNAL_API.FETCH_FAILED();
};

export const handleErrorInDatabaseFunctions = (error, context = "") => {
  if (error instanceof AppError) {
    throw error;
  }

  if (APP_CONFIG?.isDevelopment) {
    console.error(`Database error in ${context}:`, error);
  }

  if (
    error.code === "ER_NO_RECORDS_FOUND" ||
    error.message?.includes("no records found")
  ) {
    throw AppErrorTypes.DATABASE.NOT_FOUND("");
  }

  switch (error.code) {
    case "ER_DUP_ENTRY":
      throw AppErrorTypes.DATABASE.OPERATION_FAILED("Duplicate entry");
    case "ER_NO_SUCH_TABLE":
      throw AppErrorTypes.DATABASE.OPERATION_FAILED("Table not found");
    case "ER_BAD_FIELD_ERROR":
      throw AppErrorTypes.DATABASE.OPERATION_FAILED("Invalid field");
    case "ER_BAD_NULL_ERROR":
      throw AppErrorTypes.DATABASE.OPERATION_FAILED(
        "Null value in not allowed field"
      );
    case "ER_PARSE_ERROR":
      throw AppErrorTypes.DATABASE.OPERATION_FAILED("Error parsing query");
    case "ER_ACCESS_DENIED_ERROR":
      throw AppErrorTypes.DATABASE.OPERATION_FAILED("Access denied");
    case "ER_CON_COUNT_ERROR":
      throw AppErrorTypes.DATABASE.OPERATION_FAILED("Too many connections");
    case "ER_BAD_DB_ERROR":
      throw AppErrorTypes.DATABASE.OPERATION_FAILED("Database not found");
    case "ER_FULLTEXT_INDEX_NOT_FOUND":
      throw AppErrorTypes.DATABASE.OPERATION_FAILED(
        "Fulltext index not found in database"
      );
    default:
      throw AppErrorTypes.DATABASE.OPERATION_FAILED();
  }
};
