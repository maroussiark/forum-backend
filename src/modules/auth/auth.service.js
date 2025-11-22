import prisma from "../../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { unauthorized, badRequest } from "../../shared/errors/ApiError.js";
import { generateRandomToken, hashToken } from "./auth.utils.js";

dotenv.config();

class AuthService {
  generateAccessToken(user, permissions = []) {
    const isModerator =
      user.roleId === "ROLE-00001" || user.roleId === "ROLE-00002";

    return jwt.sign(
      {
        id: user.id,
        roleId: user.roleId,
        permissions,
        isModerator,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES },
    );
  }

  async generateAndStoreRefreshToken(userId) {
    const refreshToken = generateRandomToken();
    const hashed = hashToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        userId,
        token: hashed,
      },
    });

    return refreshToken;
  }

  async register(data) {
    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (exists) throw badRequest("Email déjà utilisé");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        roleId: "ROLE-00003",
      },
    });

    await prisma.userProfile.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        bio: "",
        avatarUrl: "",
        phone: "",
        socialLinks: {},
      },
    });

    const permissions = await this.getPermissions(user.roleId);

    const accessToken = this.generateAccessToken(user, permissions);
    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw unauthorized("Identifiants invalides");

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw unauthorized("Identifiants invalides");

    const permissions = await this.getPermissions(user.roleId);

    const accessToken = this.generateAccessToken(user, permissions);
    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken) {
    const hashed = hashToken(refreshToken);

    const stored = await prisma.refreshToken.findFirst({
      where: { token: hashed },
    });

    if (!stored) throw unauthorized("Refresh token invalide");

    const user = await prisma.user.findUnique({
      where: { id: stored.userId },
    });

    if (!user) throw unauthorized("Utilisateur non trouvé");

    const permissions = await this.getPermissions(user.roleId);

    const accessToken = this.generateAccessToken(user, permissions);

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const newRefreshToken = await this.generateAndStoreRefreshToken(user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async getPermissions(roleId) {
    const permissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });

    return permissions.map((p) => p.permission.name);
  }
}

export default new AuthService();
