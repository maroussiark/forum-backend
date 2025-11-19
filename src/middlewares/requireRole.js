export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user)
      return next({ status: 401, message: "Utilisateur non authentifié" });

    if (!allowedRoles.includes(req.user.roleId))
      return next({ status: 403, message: "Accès interdit" });

    next();
  };
};
