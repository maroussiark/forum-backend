import prisma from "../config/database.js";
import { generateId } from "../utils/idGenerator.js";

class CommentService {

  async addComment(userId, data) {
    const id = await generateId("comment", "CMT-");

    return prisma.comment.create({
      data: {
        id,
        userId,
        postId: data.postId,
        parentId: data.parentId || null,
        content: data.content
      }
    });
  }

  async updateComment(commentId, userId, content, isModerator) {
    const c = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!c) throw { status: 404, message: "Commentaire introuvable" };

    if (c.userId !== userId && !isModerator)
      throw { status: 403, message: "Modification non autorisée" };

    return prisma.comment.update({
      where: { id: commentId },
      data: { content }
    });
  }

  async deleteComment(commentId, userId, isModerator) {
    const c = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!c) throw { status: 404, message: "Commentaire introuvable" };

    if (c.userId !== userId && !isModerator)
      throw { status: 403, message: "Suppression non autorisée" };

    return prisma.comment.update({
      where: { id: commentId },
      data: { deleted: true }
    });
  }

  async getComments(postId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.comment.count({
        where: { postId, parentId: null, deleted: false },
      }),

      prisma.comment.findMany({
        where: {
          postId,
          parentId: null,
          deleted: false
        },
        skip,
        take: limit,
        include: {
          user: true,
          replies: {
            where: { deleted: false },
            include: {
              user: true
            }
          },
          reactions: true
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return { total, page, limit, items };
  }
}

export default new CommentService();
