import { APP_CONSTANTS } from "../constants/constants.js";

//Custom Application Error Class
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

//Database specific errors
export class DatabaseError extends AppError {
  constructor(message = "Database error occurred") {
    super(message, 500, true);
    this.name = "DatabaseError";
  }
}

//API specific errors
export class APIError extends AppError {
  constructor(message = "API error occurred", code = 400) {
    super(message, code, true);
    this.name = "APIError";
  }
}

//External API specific errors
export class ExternalAPIError extends AppError {
  constructor(message = "External API error occurred", code = 503) {
    super(message, code, true);
    this.name = "ExternalAPIError";
  }
}

//Validation specific errors
export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 422, true);
    this.name = "ValidationError";
  }
}

//Route specific errors
export class RouteError extends AppError {
  constructor(message = "Route error occurred", code = 404) {
    super(message, code, true);
    this.name = "RouteError";
  }
}

//Cron job specific errors
export class CronJobError extends AppError {
  constructor(message = "Cron job error occurred", code = 500) {
    super(message, code, true);
    this.name = "CronJobError";
  }
}

//Common App errors
export const AppErrorTypes = {
  CRON: {
    CRON_JOB_FAILED: (message = "Failed to execute cron job") =>
      new CronJobError(message, 500),
  },

  DATABASE: {
    CONNECTION_FAILED: (message = "Failed to create MySQL connection pool") =>
      new DatabaseError(message, 503),
    OPERATION_FAILED: (message = "Database operation failed") =>
      new DatabaseError(message, 500),
    TRANSACTION_FAILED: (message = "Database transaction failed") =>
      new DatabaseError(message, 500),
    RECORD_NOT_FOUND: (
      message = "The resource you are looking for is not found, it may be available in the future"
    ) => new DatabaseError(message, 404),
    MYSQL_NOT_CONFIGURED: (
      message = "MySQL configuration is incomplete. Please check database environment variables."
    ) => new DatabaseError(message, 500),
    SEEDING_FAILED: (message = "Failed to seed anime data") =>
      new DatabaseError(message, 500),
    ROLLBACK_FAILED: (message = "Failed to rollback transaction") =>
      new DatabaseError(message, 500),
    CONNECTION_RELEASE_FAILED: (
      message = "Failed to release database connection"
    ) => new DatabaseError(message, 500),
    NOT_FOUND: (message = "Record not found") =>
      new AppError(404, "DATABASE.NOT_FOUND", message),
  },

  API: {
    NOT_IMPLEMENTED: (message = "This feature is not implemented yet") =>
      new APIError(message, 501),
    RATE_LIMIT: (message = "Rate limit exceeded, please try again later") =>
      new APIError(message, 429),
    UNAUTHORIZED: (message = "Unauthorized access") =>
      new APIError(message, 401),
    FORBIDDEN: (message = "Access forbidden") => new APIError(message, 403),
    INVALID_REQUEST: (message = "Invalid request") =>
      new APIError(message, 400),
    RESOURCE_NOT_FOUND: (
      message = "The resource you are looking for is not found, it may be available in the future"
    ) => new APIError(message, 404),
    MISSING_PARAMETERS: (message = "Missing required parameters") =>
      new APIError(message, 400),
    SEEDING_TIMEOUT: (
      message = "Seeding timeout: Unable to start seeding process"
    ) => new APIError(message, 500),
  },

  EXTERNAL_API: {
    FETCH_FAILED: (
      message = "Failed to fetch data from external source, please try again later"
    ) => new ExternalAPIError(message, 503),
    PARSE_FAILED: (
      message = "Failed to parse data from external source, please try again later"
    ) => new ExternalAPIError(message, 500),
    RATE_LIMIT: (message = "Rate limit exceeded") =>
      new ExternalAPIError(message, 429),
    INVALID_REQUEST: (message = "Invalid request") =>
      new ExternalAPIError(message, 400),
  },

  ROUTE: {
    INVALID_ROUTE: (url) =>
      new RouteError(
        `My Fellow Anime Lovers, The Page You Are Looking For Is Not Found. For documentation please visit ${APP_CONSTANTS.docsUrl}`,
        404
      ),
  },
};
