import logger from "../logger/logger.js";
import { ApiError } from "./ApiError.js";

export function errorHandler(err, req, res, next) {

  // Prisma errors
  if (err.code && err.code.startsWith("P")) {
    logger.error("Prisma error", { error: err });
    return res.status(500).json({
      status: 500,
      code: "PRISMA_ERROR",
      message: "Database error",
      details: err.meta || null
    });
  }

  // Custom ApiError
  if (err instanceof ApiError) {
    logger.warn("ApiError", {
      status: err.status,
      message: err.message,
      code: err.code,
      details: err.details,
      path: req.originalUrl,
      method: req.method
    });

    return res.status(err.status).json({
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details
    });
  }

  // Generic / unknown errors
  logger.error("Unhandled error", {
    error: {
      message: err.message,
      stack: err.stack
    },
    path: req.originalUrl,
    method: req.method
  });

  return res.status(500).json({
    status: 500,
    code: "UNKNOWN_ERROR",
    message: "Une erreur interne est survenue"
  });
}
