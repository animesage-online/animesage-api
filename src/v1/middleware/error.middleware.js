import { AppError } from "../utils/appError.js";
import { APP_CONFIG } from "../constants/constants.js";
import { errorResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      errorResponse(
        err.statusCode,
        err.message,
        APP_CONFIG.isDevelopment
          ? {
              stack: err.stack,
              error: err,
            }
          : null
      )
    );
  }

  const error = new AppError("Internal Server Error");
  return res.status(500).json(
    errorResponse(
      500,
      error.message,
      APP_CONFIG.isDevelopment
        ? {
            stack: err.stack,
            error: error,
          }
        : null
    )
  );
};
