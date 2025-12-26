export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user)
      return next({ status: 401, message: "Utilisateur non authentifié" });

    const roleName = (req.user.roleName || req.user.role || "").toUpperCase();
    const roleId = req.user.roleId;

    const allowed = allowedRoles.map((r) => String(r).toUpperCase());

    // accepte si on a passé des noms (ADMIN/MODERATOR/...) OU des ids (UUID)
    const ok = allowed.includes(roleName) || allowed.includes(String(roleId).toUpperCase());

    if (!ok) return next({ status: 403, message: "Accès interdit" });

    next();
  };
};
