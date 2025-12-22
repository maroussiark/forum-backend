import prisma from "../../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { unauthorized, badRequest } from "../../shared/errors/ApiError.js";
import { generateRandomToken, hashToken } from "./auth.utils.js";
import { ROLES } from "../../shared/constants/roles.js";

dotenv.config();

class AuthService {
  generateAccessToken(user) {
    const isModerator =
      user.roleId === ROLES.ADMIN.id || user.roleId === ROLES.MODERATOR.id;

    return jwt.sign(
      {
        id: user.id,
        roleId: user.roleId,
        isModerator
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );
  }

  async generateAndStoreRefreshToken(userId) {
    const refreshToken = generateRandomToken();
    const hashed = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashed,
        expiresAt
      }
    });

    return refreshToken;
  }

  async register(data) {
    const exists = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (exists) throw badRequest("Email déjà utilisé");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const created = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        roleId: ROLES.MEMBER.id
      }
    });

    await prisma.userProfile.create({
      data: {
        userId: created.id,
        fullName: data.fullName,
        bio: "",
        avatarUrl: "",
        phone: "",
        socialLinks: {}
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: created.id },
      include: { profile: true, role: true }
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.profile?.fullName ?? "",
        roleId: user.roleId,
        roleName: user.role?.name ?? null,
        isModerator:
          user.roleId === ROLES.ADMIN.id || user.roleId === ROLES.MODERATOR.id
      },
      accessToken,
      refreshToken
    };
  }

  async login(data) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { profile: true, role: true }
    });
    if (!user) throw unauthorized("Identifiants invalides");
    if (user.deletedAt) throw unauthorized("Compte supprimé");
    if (user.blockedAt) throw unauthorized("Compte bloqué");

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw unauthorized("Identifiants invalides");

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.profile?.fullName ?? "",
        roleId: user.roleId,
        roleName: user.role?.name ?? null,
        isModerator:
          user.roleId === ROLES.ADMIN.id || user.roleId === ROLES.MODERATOR.id
      },
      accessToken,
      refreshToken
    };
  }

  async refresh(refreshToken) {
    const hashed = hashToken(refreshToken);

    const stored = await prisma.refreshToken.findFirst({
      where: { tokenHash: hashed }
    });

    if (!stored) throw unauthorized("Refresh token invalide");

    const user = await prisma.user.findUnique({
      where: { id: stored.userId },
      include: { role: true, profile: true }
    });

    if (!user) throw unauthorized("Utilisateur non trouvé");
    if (user.deletedAt) throw unauthorized("Compte supprimé");
    if (user.blockedAt) throw unauthorized("Compte bloqué");

    const accessToken = this.generateAccessToken(user);

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const newRefreshToken = await this.generateAndStoreRefreshToken(user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async getPermissions(roleId) {
    const permissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true }
    });

    return permissions.map((p) => p.permission.name);
  }
}

export default new AuthService();
