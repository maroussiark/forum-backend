import { forbidden } from "../shared/errors/ApiError.js";

export function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) throw forbidden("Authentification requise");

    if (!allowedRoles.includes(req.user.role)) {
      throw forbidden("Accès refusé (rôle insuffisant)");
    }

    next();
  };
}
