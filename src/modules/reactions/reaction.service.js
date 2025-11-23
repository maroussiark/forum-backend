import prisma from "../../config/database.js";
import {
  notFound,
  forbidden,
  badRequest,
} from "../../shared/errors/ApiError.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";
import NotificationService from "../notifications/notification.service.js";

class ReactionService {
  async react(userId, data, io) {
    const { postId, commentId, type } = data;

    if (!postId && !commentId) throw badRequest("postId XOR commentId requis");
    if (postId && commentId)
      throw badRequest("Envoyer seulement postId ou commentId, pas les deux");

    let entity;
    let entityType;
    let ownerId;

    if (postId) {
      entity = await prisma.post.findUnique({
        where: { id: postId, deleted: false },
        include: { user: true },
      });

      if (!entity) throw notFound("Post introuvable");

      entityType = "POST";
      ownerId = entity.userId;
    }

    if (commentId) {
      entity = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          user: true,
          post: true,
        },
      });

      if (!entity) throw notFound("Commentaire introuvable");

      entityType = "COMMENT";
      ownerId = entity.userId;
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { fullName: true },
    });

    const isPost = !!postId;

    const where = isPost
      ? { userId_postId: { userId, postId } }
      : { userId_commentId: { userId, commentId } };

    const reaction = await prisma.reaction.upsert({
      where,
      update: { reactionType: type },
      create: {
        userId,
        postId: postId ?? null,
        commentId: commentId ?? null,
        reactionType: type,
      },
      include: {
        user: { select: safeUserSelect },
      },
    });

    if (ownerId !== userId) {
      const title =
        entityType === "POST"
          ? "Nouvelle réaction sur votre post"
          : "Nouvelle réaction sur votre commentaire";

      const text = `${profile.fullName} a réagi à votre ${entityType === "POST" ? "post" : "commentaire"}`;

      await NotificationService.notify(
        ownerId,
        userId,
        entityType === "POST" ? "POST_REACTED" : "COMMENT_REACTED",
        title,
        text,
        postId || commentId,
        entityType,
        io,
      );
    }

    return reaction;
  }

  async remove(reactionId, userId, isModerator) {
    const reaction = await prisma.reaction.findUnique({
      where: { id: reactionId },
    });
    if (!reaction) throw notFound("Réaction introuvable");

    if (reaction.userId !== userId && !isModerator)
      throw forbidden("Non autorisé");

    return prisma.reaction.delete({ where: { id: reactionId } });
  }
}

export default new ReactionService();
