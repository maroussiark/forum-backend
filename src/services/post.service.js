import prisma from "../config/database.js";
import { generateId } from "../utils/idGenerator.js";
import { safeUserSelect } from "../shared/selectors/safeUserSelect.js";

class PostService {

  async createPost(userId, data) {
    const id = await generateId("post", "PST-");

    return prisma.post.create({
      data: {
        id,
        userId,
        title: data.title,
        content: data.content,
        categoryId: data.categoryId || null
      }
    });
  }

  async updatePost(postId, userId, data, isModerator = false) {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) throw { status: 404, message: "Post introuvable" };

    if (post.userId !== userId && !isModerator)
      throw { status: 403, message: "Modification non autorisée" };

    return prisma.post.update({
      where: { id: postId },
      data
    });
  }

  async deletePost(postId, userId, isModerator = false) {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) throw { status: 404, message: "Post introuvable" };

    if (post.userId !== userId && !isModerator)
      throw { status: 403, message: "Suppression non autorisée" };

    return prisma.post.update({
      where: { id: postId },
      data: { deleted: true }
    });
  }

  async getPostById(postId) {
    return prisma.post.findFirst({
      where: { id: postId, deleted: false },
      include: {
        user: { select: safeUserSelect },
        attachments: true,
        category: true
      }
    });
  }

  async getPosts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.post.count({ where: { deleted: false } }),
      prisma.post.findMany({
        where: { deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: safeUserSelect },
          attachments: true
        }
      })
    ]);

    return { total, page, limit, items };
  }
}

export default new PostService();
