import { forbidden } from "../shared/errors/ApiError.js";
import { ACL } from "../shared/constants/acl.js";
import { ROLES } from "../shared/constants/roles.js";

function resolveRoleCodeFromRoleId(roleId) {
  if (!roleId || !ROLES) return null;

  // On tente de retrouver le "code" à partir de l'id
  const entries = Object.values(ROLES);
  for (const r of entries) {
    if (!r) continue;
    if (r.id === roleId) return r.code || r.name || r.key || null;
  }
  return null;
}

export const requirePermission = (permissionCode) => {
  return (req, res, next) => {
    if (!req.user) throw forbidden("Authentification requise");

    const roleId = req.user.roleId || null;
    const roleCode = req.user.role || req.user.roleCode || resolveRoleCodeFromRoleId(roleId);

    // ACL peut être indexé par roleId OU par roleCode
    const allowedPermissions =
      (roleId && ACL[roleId]) ||
      (roleCode && ACL[roleCode]) ||
      [];

    if (!allowedPermissions.includes(permissionCode)) {
      throw forbidden("Permission insuffisante");
    }

    next();
  };
};
