import prisma from "../../config/database.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";

class PostRepository {

  async create(data) {
    return prisma.post.create({
      data,
      include: {
        user: { select: safeUserSelect },
        attachments: true,
        _count: { select: { comments: true, reactions: true } }
      }
    });
  }

  async findById(postId) {
    return prisma.post.findFirst({
      where: { id: postId, deleted: false },
      include: {
        user: { select: safeUserSelect },
        attachments: true,
        _count: { select: { comments: true, reactions: true } }
      }
    });
  }

  async update(postId, data) {
    return prisma.post.update({
      where: { id: postId },
      data,
      include: {
        user: { select: safeUserSelect },
        attachments: true,
        _count: { select: { comments: true, reactions: true } }
      }
    });
  }

  async softDelete(postId) {
    return prisma.post.update({
      where: { id: postId },
      data: { deleted: true }
    });
  }
}

export default new PostRepository();
