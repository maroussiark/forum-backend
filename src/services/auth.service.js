import prisma from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


class AuthService {
  generateAccessToken(user) {
    const isModerator = user.roleId === "ROLE-00001" || user.roleId === "ROLE-00002";
    return jwt.sign(
      { id: user.id, roleId: user.roleId, isModerator },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_EXPIRES }
    );
  }

  async register({ email, password, fullName }) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw { status: 400, message: "Email déjà utilisé" };

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        fullName,
        roleId: 3
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      },
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user)
    };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 404, message: "Utilisateur introuvable" };

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw { status: 400, message: "Mot de passe incorrect" };

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      },
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user)
    };
  }

  async refreshAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) throw new Error();

      return {
        accessToken: this.generateAccessToken(user)
      };
    } catch {
      throw { status: 401, message: "Refresh token invalide" };
    }
  }
}

export default new AuthService();
