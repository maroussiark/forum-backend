import { forbidden } from "../shared/errors/ApiError.js";
import { ACL } from "../shared/constants/acl.js";

export const requirePermission = (permissionCode) => {
  return (req, res, next) => {
    if (!req.user) throw forbidden("Authentification requise");

    const roleName = (req.user.role || "").toUpperCase();
    const allowedPermissions = ACL[roleName] || [];

    if (!allowedPermissions.includes(permissionCode)) {
      throw forbidden("Permission insuffisante");
    }

    next();
  };
};
