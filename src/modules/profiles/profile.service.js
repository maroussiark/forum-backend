import prisma from "../../config/database.js";
import { notFound, forbidden } from "../../shared/errors/ApiError.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";
import { DEFAULT_AVATAR } from "../../shared/constants/defaultAvatar.js";
import { processAvatar } from "./profile.upload.js";

class ProfileService {

  async getProfile(userId) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: { select: safeUserSelect }
      }
    });

    if (!profile) throw notFound("Profil introuvable");

    return profile;
  }

  async updateProfile(userId, requesterId, isModerator, data, file, io) {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) throw notFound("Profil introuvable");

    if (userId !== requesterId && !isModerator) {
      throw forbidden("Modification non autorisée");
    }

    const allowed = {
      fullName: data.fullName ?? profile.fullName,
      bio: data.bio ?? profile.bio,
      phone: data.phone ?? profile.phone,
      socialLinks: data.socialLinks ?? profile.socialLinks
    };

    let avatarUrl = profile.avatarUrl;

    if (file) {
      avatarUrl = await processAvatar(file);
    }

    if (!avatarUrl) avatarUrl = DEFAULT_AVATAR;

    const updated = await prisma.userProfile.update({
      where: { userId },
      data: {
        ...allowed,
        avatarUrl
      },
      include: {
        user: { select: safeUserSelect }
      }
    });

    if (io) {
      io.emit("profile:updated", {
        userId: updated.userId,
        avatarUrl: updated.avatarUrl,
        fullName: updated.fullName
      });
    }

    return updated;
  }
}

export default new ProfileService();
