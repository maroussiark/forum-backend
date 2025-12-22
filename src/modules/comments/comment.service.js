import prisma from "../../config/database.js";
import { notFound, forbidden } from "../../shared/errors/ApiError.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";
import { generateId } from "../../utils/idGenerator.js";
import NotificationService from "../notifications/notification.service.js";

class CommentService {
  async create(userId, data, io) {
    const post = await prisma.post.findUnique({
      where: { id: data.postId, deleted: false }
    });

    if (!post) throw notFound("Post introuvable");

    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    const id = await generateId("comment", "CMT-");

    await NotificationService.notify(
      post.userId,
      userId,
      "POST_COMMENTED",
      "Nouveau commentaire",
      `${profile?.fullName ?? "Quelqu’un"} a commenté votre post`,
      post.id,
      "POST",
      io
    );

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
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    if (!comment || comment.deleted) throw notFound("Commentaire introuvable");

    if (comment.userId !== userId && !isModerator) throw forbidden("Non autorisé");

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
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    if (!comment || comment.deleted) throw notFound("Commentaire introuvable");

    if (comment.userId !== userId && !isModerator) throw forbidden("Non autorisé");

    return prisma.comment.update({
      where: { id: commentId },
      data: { deleted: true }
    });
  }

  async list(postId, userId, skip = 0, take = 20) {
    const comment = await prisma.comment.findMany({
      where: { postId, deleted: false },
      orderBy: { createdAt: "asc" },
      skip,
      take,
      include: {
        user: { select: safeUserSelect },
        _count: { select: { reactions: true } }
      }
    });

    if (userId) {
      for (const coms of comment) {
        const reaction = await prisma.reaction.findFirst({
          where: {
            commentId: coms.id,
            userId
          },
          select: {
            id: true,
            reactionType: true
          }
        });
        coms.myReaction = reaction || null;
      }
    } else {
      for (const coms of comment) coms.myReaction = null;
    }

    return comment;
  }
}

export default new CommentService();
