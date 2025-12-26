import { forbidden } from "../shared/errors/ApiError.js";
import { ROLES } from "../shared/constants/roles.js";

function resolveRoleCodeFromRoleId(roleId) {
  if (!roleId || !ROLES) return null;

  const entries = Object.values(ROLES);
  for (const r of entries) {
    if (!r) continue;
    if (r.id === roleId) return r.code || r.name || r.key || null;
  }
  return null;
}

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) throw forbidden("Authentification requise");

    const roleId = req.user.roleId || null;
    const roleCode = req.user.role || req.user.roleCode || resolveRoleCodeFromRoleId(roleId);

    // On accepte que allowedRoles contienne des roleId OU des codes ("ADMIN")
    const ok =
      (roleId && allowedRoles.includes(roleId)) ||
      (roleCode && allowedRoles.includes(roleCode));

    if (!ok) throw forbidden("Accès interdit");

    next();
  };
};
