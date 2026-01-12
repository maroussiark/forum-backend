import { forbidden } from "../shared/errors/ApiError.js";
import { ACL } from "../shared/constants/acl.js";
import logger from "../shared/logger/logger.js";

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

    // debug logging to help track 403 causes
    logger.debug("requirePermission check", {
      permissionCode,
      roleName: roleName || null,
      roleId: roleId || null,
      allowedPermissionsLength: allowedPermissions.length,
      allowedPermissionsSample: allowedPermissions.slice(0, 10)
    });

    if (!allowedPermissions.includes(permissionCode)) {
      logger.warn("Permission denied", {
        permissionCode,
        roleName: roleName || null,
        roleId: roleId || null,
        allowedPermissions
      });

      return next(forbidden("Permission insuffisante"));
    }

    next();
  };
};
