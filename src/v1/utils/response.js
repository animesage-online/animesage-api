import httpStatus from "http-status";
import { APP_CONFIG } from "../constants/constants.js";

export const successResponse = (
  statusCode = 200,
  message,
  data,
  note = null
) => {
  return {
    success: true,
    statusCode: statusCode,
    message: message || httpStatus[statusCode],
    ...(note && { note }),
    data: data || null,
  };
};

export const errorResponse = (statusCode = 500, message, error = null) => {
  return {
    success: false,
    statusCode: statusCode,
    message: message || httpStatus[statusCode],
    ...(APP_CONFIG.isDevelopment && { error }),
  };
};

export const paginatedSuccessResponse = (
  statusCode,
  message,
  data,
  pagination,
  note = null
) => {
  return {
    success: true,
    statusCode: statusCode,
    message: message || httpStatus[statusCode],
    pagination: {
      page: pagination.currentPage,
      totalPages: pagination.lastPage,
      totalItems: pagination.total,
      perPage: pagination.perPage,
      hasNextPage: pagination.hasNextPage,
    },
    ...(note && { note }),
    data,
  };
};
