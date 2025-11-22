import prisma from "../../config/database.js";
import { notFound, forbidden } from "../../shared/errors/ApiError.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";
import { generateId } from "../../utils/idGenerator.js";

class CommentService {

  async create(userId, data) {
    const post = await prisma.post.findUnique({
      where: { id: data.postId, deleted: false }
    });

    if (!post) throw notFound("Post introuvable");

    const id = await generateId("comment", "CMT-");

    return prisma.comment.create({
      data: {
        id,
        userId,
        postId: data.postId,
        content: data.content
      },
      include: {
        user: { select: safeUserSelect },
        _count: { select: { reactions: true } }
      }
    });
  }

  async update(commentId, userId, isModerator, content) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw notFound("Commentaire introuvable");

    if (comment.userId !== userId && !isModerator)
      throw forbidden("Non autorisé");

    return prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: { select: safeUserSelect },
        _count: { select: { reactions: true } }
      }
    });
  }

  async remove(commentId, userId, isModerator) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw notFound("Commentaire introuvable");

    if (comment.userId !== userId && !isModerator)
      throw forbidden("Non autorisé");

    return prisma.comment.delete({ where: { id: commentId } });
  }
}

export default new CommentService();
