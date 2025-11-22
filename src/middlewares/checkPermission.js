import { forbidden } from "../shared/errors/ApiError.js";
import { ACL } from "../shared/constants/acl.js";

export function checkPermission(permission) {
  return (req, res, next) => {
    if (!req.user) throw forbidden("Authentification requise");

    const role = req.user.role;

    const allowedPermissions = ACL[role] || [];

    if (!allowedPermissions.includes(permission)) {
      throw forbidden("Permission insuffisante");
    }

    next();
  };
}
