import prisma from "../../config/database.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";

class FeedService {
  async list(page = 1, limit = 10, categoryId, userId) {
    page = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    limit = Number.isFinite(limit) && limit > 0 && limit <= 50 ? Math.floor(limit) : 10;

    const where = {
      deleted: false,
      ...(categoryId ? { categoryId } : {})
    };

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: safeUserSelect },
        attachments: true,
        _count: {
          select: { comments: true, reactions: true }
        }
      }
    });

    if (userId) {
      for (const post of posts) {
        const reaction = await prisma.reaction.findFirst({
          where: {
            postId: post.id,
            userId: userId
          },
          select: {
            id: true,
            reactionType: true
          }
        });

        post.myReaction = reaction || null;
      }
    } else {
      for (const post of posts) post.myReaction = null;
    }

    return posts;
  }
}

export default new FeedService();
