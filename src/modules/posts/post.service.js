import PostRepository from "./post.repository.js";
import prisma from "../../config/database.js";
import { notFound, forbidden } from "../../shared/errors/ApiError.js";
import { generateId } from "../../utils/idGenerator.js";
import AttachmentService from "./attachment.service.js";
import { prepareFiles } from "./attachment.upload.js";

class PostService {

  async getPostByUserId(userId,userConnected) {
    return PostRepository.findByUserId(userId,userConnected);
  }

  async create(userId, data, files) {
    const id = await generateId("post", "PST-");

    const post = await PostRepository.create({
      id,
      userId,
      title: data.title,
      content: data.content,
      categoryId: data.categoryId || null,
    });

    if (files?.length) {
      const prepared = await prepareFiles(files);
      await AttachmentService.processAndStore(post.id, prepared);
    }

    return this.getById(post.id);
  }

  async getById(postId) {
    const post = await PostRepository.findById(postId);
    if (!post) throw notFound("Post introuvable");
    return post;
  }

  async update(postId, userId, isModerator, data) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.deleted) throw notFound("Post introuvable");

    if (post.userId !== userId && !isModerator) {
      throw forbidden("Modification non autorisée");
    }

    const payload = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.content !== undefined) payload.content = data.content;
    if (data.categoryId !== undefined)
      payload.categoryId = data.categoryId || null;

    return PostRepository.update(postId, payload);
  }

  async remove(postId, userId, isModerator) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.deleted) throw notFound("Post introuvable");

    if (post.userId !== userId && !isModerator) {
      throw forbidden("Suppression non autorisée");
    }

    return PostRepository.softDelete(postId);
  }
}

export default new PostService();
