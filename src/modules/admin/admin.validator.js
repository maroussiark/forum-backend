import prisma from "../../config/database.js";
import { notFound } from "../../shared/errors/ApiError.js";

const safeUserSelect = {
  id: true,
  email: true,
  roleId: true,
  blockedAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  profile: { select: { fullName: true, avatarUrl: true } },
  role: { select: { id: true, name: true } },
};

class AdminService {
  async stats() {
    const [users, posts, comments, messages] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.post.count({ where: { deleted: false } }),
      prisma.comment.count({ where: { deleted: false } }),
      prisma.message.count(),
    ]);

    return { users, posts, comments, messages };
  }

  async roles() {
    return prisma.role.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: "asc" },
    });
  }

  async listUsers({ page = 1, limit = 20, q = "", includeDeleted = false }) {
    const skip = (page - 1) * limit;

    const where = {
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { profile: { is: { fullName: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: safeUserSelect,
      }),
    ]);

    return { total, page, limit, items };
  }

  async setUserRole(userId, roleId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw notFound("Utilisateur introuvable");

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw notFound("Rôle introuvable");

    return prisma.user.update({
      where: { id: userId },
      data: { roleId },
      select: safeUserSelect,
    });
  }

  async setUserBlocked(userId, blocked) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw notFound("Utilisateur introuvable");

    return prisma.user.update({
      where: { id: userId },
      data: { blockedAt: blocked ? new Date() : null },
      select: safeUserSelect,
    });
  }

  async softDeleteUser(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw notFound("Utilisateur introuvable");

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
      select: { id: true },
    });

    return true;
  }

  async listPosts({ page = 1, limit = 20, q = "", includeDeleted = false }) {
    const skip = (page - 1) * limit;

    const where = {
      ...(includeDeleted ? {} : { deleted: false }),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          deleted: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
          _count: { select: { comments: true, reactions: true } },
        },
      }),
    ]);

    return { total, page, limit, items };
  }

  async setPostVisibility(postId, deleted) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw notFound("Post introuvable");

    return prisma.post.update({
      where: { id: postId },
      data: { deleted },
      select: { id: true, deleted: true },
    });
  }

  async listComments({ page = 1, limit = 20, q = "", includeDeleted = false }) {
    const skip = (page - 1) * limit;

    const where = {
      ...(includeDeleted ? {} : { deleted: false }),
      ...(q ? { content: { contains: q, mode: "insensitive" } } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.comment.count({ where }),
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          content: true,
          deleted: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
          post: { select: { id: true, title: true } },
        },
      }),
    ]);

    return { total, page, limit, items };
  }

  async setCommentVisibility(commentId, deleted) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw notFound("Commentaire introuvable");

    return prisma.comment.update({
      where: { id: commentId },
      data: { deleted },
      select: { id: true, deleted: true },
    });
  }
}

export default new AdminService();
