import { forbidden } from "../shared/errors/ApiError.js";

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return next(forbidden("Utilisateur non authentifié"));

    const candidates = [req.user.roleName, req.user.roleId].filter(Boolean);
    const allowed = new Set(allowedRoles.filter(Boolean));

    const ok = candidates.some((r) => allowed.has(r));
    if (!ok) return next(forbidden("Accès interdit"));

    next();
  };
};
