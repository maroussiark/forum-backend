import prisma from "../../config/database.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";

class PostRepository {

async findByUserId(userId,userConnected) {
  const posts = await prisma.post.findMany({
    where: { userId, deleted: false },
    include: {
      user: { select: safeUserSelect },
      attachments: true,
      _count: { select: { comments: true, reactions: true } }
    }
  });
   if (userConnected) {
      for (const post of posts) {
        const reaction = await prisma.reaction.findFirst({
          where: {
            postId: post.id,
            userId: userConnected
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
