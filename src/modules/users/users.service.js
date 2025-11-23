import prisma from "../../config/database.js";
import { notFound, forbidden } from "../../shared/errors/ApiError.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";

class UsersService {

  async getById(userId) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: safeUserSelect
    });

    if (!user) throw notFound("Utilisateur introuvable");
    return user;
  }

  async updateUser(userId, requesterId, isModerator, data) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound("Utilisateur introuvable");

    if (user.id !== requesterId && !isModerator) {
      throw forbidden("Modification non autorisée");
    }

    const allowed = {};
    if (data.email) allowed.email = data.email;
    if (data.password) allowed.password = data.password;

    return prisma.user.update({
      where: { id: userId },
      data: allowed,
      select: safeUserSelect
    });
  }

  async softDelete(userId, requesterId, isModerator) {
    if (userId !== requesterId && !isModerator) {
      throw forbidden("Suppression non autorisée");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw notFound("Utilisateur introuvable");

    return prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() }
    });
  }
}

export default new UsersService();
