import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const auth = () => {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return next({ status: 401, message: "Token manquant" });

    const token = header.split(" ")[1];
    if (!token) return next({ status: 401, message: "Token invalide" });

    try {
      // eslint-disable-next-line no-undef
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, roleId }
      next();
    } catch {
      next({ status: 401, message: "Token expiré ou invalide" });
    }
  };
};
