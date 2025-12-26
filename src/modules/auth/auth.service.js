import prisma from "../../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { badRequest, unauthorized } from "../../shared/errors/ApiError.js";
import { ROLES } from "../../shared/constants/roles.js";

class AuthService {
  async register(data) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw badRequest("Email déjà utilisé");

    const password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password,
        roleId: ROLES.MEMBER.id,
        profile: {
          create: {
            fullName: data.fullName,
            avatarUrl: "",
          },
        },
      },
      select: {
        id: true,
        email: true,
        roleId: true,
        createdAt: true,
        profile: { select: { fullName: true } },
      },
    });

    const accessToken = this.generateAccessToken({
      id: user.id,
      roleId: user.roleId,
    });

    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        fullName: user.profile?.fullName ?? "",
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email }, // ✅ string
      select: {
        id: true,
        email: true,
        password: true,
        roleId: true,
        createdAt: true,
        deletedAt: true,
        blockedAt: true,
        role: { select: { name: true } },
        profile: { select: { fullName: true, avatarUrl: true } },
      },
    });

    if (!user || user.deletedAt) throw unauthorized("Identifiants invalides");
    if (user.blockedAt) throw unauthorized("Compte bloqué");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw unauthorized("Identifiants invalides");

    const accessToken = jwt.sign(
      { id: user.id, roleId: user.roleId, roleName: user.role?.name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role?.name,
        fullName: user.profile?.fullName ?? "",
        avatarUrl: user.profile?.avatarUrl ?? "",
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
  }

  async createRefreshToken(userId) {
    const token = jwt.sign({ userId }, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
    });

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return token;
  }
}

export default new AuthService();
