import prisma from "../config/database.js";
import bcrypt from "bcrypt";
import { generateId } from "../utils/idGenerator.js";

class UserService {
  // --- CREATE ---

  async createUser({ email, password, fullName, roleId }) {
    const id = await generateId("user", "USR-");

    const hashed = await bcrypt.hash(password, 10);

    return prisma.user.create({
      data: {
        id,
        email,
        password: hashed,
        fullName,
        roleId,
      },
    });
  }

  // --- GET ALL ---
  async getUsers() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // --- GET ONE ---
  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user)
      throw {
        status: 404,
        message: "Utilisateur introuvable",
        code: "USER_NOT_FOUND",
      };

    return user;
  }

  // --- UPDATE PROFILE ---
  async updateProfile(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        role: true,
      },
    });
  }

  // --- UPDATE PASSWORD ---
  async updatePassword(id, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw { status: 404, message: "Utilisateur introuvable" };

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw { status: 400, message: "Ancien mot de passe incorrect" };

    const hashed = await bcrypt.hash(newPassword, 10);

    return prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
  }

  // --- SET AVATAR ---
  async updateAvatar(id, filename) {
    return prisma.user.update({
      where: { id },
      data: { avatar: filename },
    });
  }

  // --- SOFT DELETE ---
  async deleteUser(id) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export default new UserService();
