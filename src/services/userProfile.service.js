import prisma from "../config/database.js";
import { generateId } from "../utils/idGenerator.js";

class UserProfileService {

  async getProfile(userId) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!profile) throw { status: 404, message: "Profil introuvable" };
    return profile;
  }

  async updateProfile(userId, data) {
    let profile = await prisma.userProfile.findUnique({ where: { userId } });

    if (!profile) {
      const id = await generateId("userProfile", "PRF-");
      profile = await prisma.userProfile.create({
        data: { id, userId, ...data }
      });
    } else {
      profile = await prisma.userProfile.update({
        where: { userId },
        data
      });
    }

    return profile;
  }

  async updateAvatar(userId, avatarUrl) {
    return prisma.userProfile.update({
      where: { userId },
      data: { avatarUrl }
    });
  }

  async searchUsers(query) {
    return prisma.userProfile.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        user: {
          select: { email: true }
        }
      }
    });
  }
}

export default new UserProfileService();
