import prisma from "../../config/database.js";
import { notFound, badRequest } from "../../shared/errors/ApiError.js";
import { ROLES } from "../../shared/constants/roles.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";

class AdminService {
  async stats() {
    const [users, posts, messages, comments] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.post.count({ where: { deleted: false } }),
      prisma.message.count(),
      prisma.comment.count({ where: { deleted: false } })
    ]);

    return { users, posts, messages, comments };
  }

  async listUsers(query) {
    const q = (query.q ?? "").toString().trim();
    const includeDeleted = query.includeDeleted === "1" || query.includeDeleted === "true";
    const includeBlocked = query.includeBlocked === "1" || query.includeBlocked === "true";

    return prisma.user.findMany({
      where: {
        ...(includeDeleted ? {} : { deletedAt: null }),
        ...(includeBlocked ? {} : { blockedAt: null }),
        ...(q
          ? {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { profile: { is: { fullName: { contains: q, mode: "insensitive" } } } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      select: safeUserSelect
    });
  }

  async setUserRole(userId, body) {
    const roleId = body?.roleId;
    if (!roleId) throw badRequest("roleId requis");

    const allowed = new Set([ROLES.ADMIN.id, ROLES.MODERATOR.id, ROLES.MEMBER.id]);
    if (!allowed.has(roleId)) throw badRequest("roleId invalide");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound("Utilisateur introuvable");

    return prisma.user.update({
      where: { id: userId },
      data: { roleId },
      select: safeUserSelect
    });
  }

  async setUserBlock(userId, body) {
    const blocked = body?.blocked;
    if (typeof blocked !== "boolean") throw badRequest("blocked (boolean) requis");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound("Utilisateur introuvable");

    return prisma.user.update({
      where: { id: userId },
      data: { blockedAt: blocked ? new Date() : null },
      select: safeUserSelect
    });
  }

  async softDeleteUser(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound("Utilisateur introuvable");

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), blockedAt: null }
    });
  }

  async listPosts(query) {
    const includeDeleted = query.includeDeleted === "1" || query.includeDeleted === "true";
    const q = (query.q ?? "").toString().trim();

    return prisma.post.findMany({
      where: {
        ...(includeDeleted ? {} : { deleted: false }),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: safeUserSelect },
        attachments: true,
        _count: { select: { comments: true, reactions: true } }
      }
    });
  }

  async setPostVisibility(postId, body) {
    const deleted = body?.deleted;
    if (typeof deleted !== "boolean") throw badRequest("deleted (boolean) requis");

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw notFound("Post introuvable");

    return prisma.post.update({
      where: { id: postId },
      data: { deleted }
    });
  }

  async listComments(query) {
    const includeDeleted = query.includeDeleted === "1" || query.includeDeleted === "true";
    const q = (query.q ?? "").toString().trim();

    return prisma.comment.findMany({
      where: {
        ...(includeDeleted ? {} : { deleted: false }),
        ...(q ? { content: { contains: q, mode: "insensitive" } } : {})
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: safeUserSelect },
        post: { select: { id: true, title: true, deleted: true } },
        _count: { select: { reactions: true } }
      }
    });
  }

  async setCommentVisibility(commentId, body) {
    const deleted = body?.deleted;
    if (typeof deleted !== "boolean") throw badRequest("deleted (boolean) requis");

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw notFound("Commentaire introuvable");

    return prisma.comment.update({
      where: { id: commentId },
      data: { deleted }
    });
  }
}

export default new AdminService();
