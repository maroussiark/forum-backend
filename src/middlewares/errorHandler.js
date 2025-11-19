import logger from "../config/logger.js";
import { error } from "../utils/apiResponse.js";

export const errorHandler = (err, req, res) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    route: req.originalUrl
  });

  const status = err.status || 500;
  const code = err.code || null;

  return error(res, err.message, status, code);
};
