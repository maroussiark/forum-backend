import prisma from "../config/database.js";
import { safeUserSelect } from "../shared/selectors/safeUserSelect.js";

class FeedService {

  async getFeed({ cursor, limit = 10, categoryId, tagId, sort = "recent" }) {

    const filters = {
      deleted: false
    };

    if (categoryId) filters.categoryId = categoryId;

    // TAGS
    let tagFilter = {};
    if (tagId) {
      tagFilter = {
        tags: {
          some: { tagId }
        }
      };
    }

    // SORTING
    let orderBy = { createdAt: "desc" };

    if (sort === "popular") {
      orderBy = {
        reactions: { _count: "desc" }
      };
    }

    // CURSOR PAGINATION
    const query = {
      where: {
        ...filters,
        ...tagFilter
      },
      take: Number(limit),
      orderBy,
      include: {
        user: { select: safeUserSelect },
        attachments: true,
        reactions: true,
        comments: true
      }
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1; // éviter de reprendre le même
    }

    const posts = await prisma.post.findMany(query);

    const nextCursor = posts.length ? posts[posts.length - 1].id : null;

    return {
      items: posts,
      nextCursor
    };
  }
}

export default new FeedService();
