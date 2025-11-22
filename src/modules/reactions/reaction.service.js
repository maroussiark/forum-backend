import prisma from "../../config/database.js";
import { notFound, forbidden, badRequest } from "../../shared/errors/ApiError.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";

class ReactionService {

  async react(userId, data) {
    if (!data.postId && !data.commentId)
      throw badRequest("postId XOR commentId requis");

    if (data.postId) {
      const exists = await prisma.post.findFirst({
        where: { id: data.postId, deleted: false }
      });
      if (!exists) throw notFound("Post introuvable");
    }

    if (data.commentId) {
      const exists = await prisma.comment.findUnique({
        where: { id: data.commentId }
      });
      if (!exists) throw notFound("Commentaire introuvable");
    }

    const reaction = await prisma.reaction.upsert({
      where: {
        userId_postId_commentId: {
          userId,
          postId: data.postId || null,
          commentId: data.commentId || null
        }
      },
      update: { type: data.type },
      create: {
        userId,
        postId: data.postId || null,
        commentId: data.commentId || null,
        type: data.type
      },
      include: {
        user: { select: safeUserSelect }
      }
    });

    return reaction;
  }

  async remove(reactionId, userId, isModerator) {
    const reaction = await prisma.reaction.findUnique({ where: { id: reactionId } });
    if (!reaction) throw notFound("Réaction introuvable");

    if (reaction.userId !== userId && !isModerator)
      throw forbidden("Non autorisé");

    return prisma.reaction.delete({ where: { id: reactionId } });
  }
}

export default new ReactionService();
