export class ApiError extends Error {
  constructor(status, message, code = null, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, code = "BAD_REQUEST", details = null) =>
  new ApiError(400, message, code, details);

export const unauthorized = (message = "Non authentifié", code = "UNAUTHORIZED") =>
  new ApiError(401, message, code);

export const forbidden = (message = "Accès refusé", code = "FORBIDDEN") =>
  new ApiError(403, message, code);

export const notFound = (message = "Ressource introuvable", code = "NOT_FOUND") =>
  new ApiError(404, message, code);
