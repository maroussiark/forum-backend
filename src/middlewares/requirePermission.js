import { forbidden } from "../shared/errors/ApiError.js";
import { ACL } from "../shared/constants/acl.js";

export const requirePermission = (permissionCode) => {
  return (req, res, next) => {
    if (!req.user) return next(forbidden("Authentification requise"));

    const roleName = req.user.roleName;
    const roleId = req.user.roleId;

    const allowedByName = roleName ? ACL[roleName] : null;
    const allowedById = roleId ? ACL[roleId] : null;

    const allowedPermissions =
      (Array.isArray(allowedByName) ? allowedByName : null) ||
      (Array.isArray(allowedById) ? allowedById : null) ||
      [];

    if (!allowedPermissions.includes(permissionCode)) {
      return next(forbidden("Permission insuffisante"));
    }

    next();
  };
};
