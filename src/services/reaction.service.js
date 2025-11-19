import prisma from "../config/database.js";
import { generateId } from "../utils/idGenerator.js";

class ReactionService {

  async addReaction(userId, data) {
    const { postId, commentId, reactionType } = data;

    const id = await generateId("reaction", "RCT-");

    return prisma.reaction.create({
      data: {
        id,
        userId,
        postId: postId || null,
        commentId: commentId || null,
        reactionType
      }
    });
  }

  async removeReaction(userId, postId, commentId) {
    return prisma.reaction.delete({
      where: {
        userId_postId_commentId: {
          userId,
          postId: postId || null,
          commentId: commentId || null
        }
      }
    });
  }
}

export default new ReactionService();
