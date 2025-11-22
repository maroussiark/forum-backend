import prisma from "../../config/database.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";

class FeedService {

  async list(page, limit, categoryId) {

    const where = {
      deleted: false,
      ...(categoryId ? { categoryId } : {})
    };

    return prisma.post.findMany({
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
  }
}

export default new FeedService();
