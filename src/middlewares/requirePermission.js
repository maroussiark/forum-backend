import prisma from "../config/database.js";

export const requirePermission = (permissionCode) => {
  return async (req, res, next) => {
    if (!req.user)
      return next({ status: 401, message: "Non authentifié" });

    const perms = await prisma.rolePermission.findMany({
      where: { roleId: req.user.roleId },
      select: { permission: true }
    });

    const hasPermission = perms.some(p => p.permission.code === permissionCode);

    if (!hasPermission)
      return next({ status: 403, message: "Permission refusée" });

    next();
  };
};
