import { forbidden } from "../shared/errors/ApiError.js";
import { ACL } from "../shared/constants/acl.js";

export const requirePermission = (permissionCode) => {
  return (req, res, next) => {
    if (!req.user) throw forbidden("Authentification requise");

    // ✅ on tente d'abord roleName (ADMIN/MODERATOR/USER), puis fallback sur roleId
    const keys = [req.user.roleName, req.user.roleId].filter(Boolean);

    // Union des permissions possibles
    const allowedPermissions = [
      ...new Set(keys.flatMap((k) => ACL[k] || [])),
    ];

    if (!allowedPermissions.includes(permissionCode)) {
      throw forbidden("Permission insuffisante");
    }

    next();
  };
};
