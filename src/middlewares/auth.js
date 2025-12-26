import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { unauthorized } from "../shared/errors/ApiError.js";
import { ROLES } from "../shared/constants/roles.js";

export const auth = () => {
  return async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return next(unauthorized("Authentification requise"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          roleId: true,
          deletedAt: true,
          blockedAt: true,
          role: { select: { id: true, name: true } },
        },
      });

      if (!dbUser || dbUser.deletedAt) {
        return next(unauthorized("Compte introuvable ou supprimé"));
      }
      if (dbUser.blockedAt) {
        return next(unauthorized("Compte bloqué"));
      }

      const roleId = dbUser.role?.id || dbUser.roleId;
      const roleName = dbUser.role?.name || decoded?.roleName || null;

      req.user = {
        id: dbUser.id,
        roleId,
        roleName,
        isModerator:
          roleId === ROLES.ADMIN.id || roleId === ROLES.MODERATOR.id,
      };

      next();
    } catch (e) {
      return next(unauthorized("Token invalide"));
    }
  };
};
