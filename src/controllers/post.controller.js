import PostService from "../services/post.service.js";
import AttachmentService from "../services/attachment.service.js";
import { success } from "../utils/apiResponse.js";

class PostController {

  async create(req, res, next) {
    try {
      const id = req.user.id;
      const post = await PostService.createPost(id, req.body);

      // fichiers ?
      if (req.files) {
        for (const file of req.files) {
          await AttachmentService.addAttachment(post.id, file);
        }
      }

      return success(res, post, "Post créé", 201);
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const userId = req.user.id;

      const post = await PostService.updatePost(
        req.params.postId,
        userId,
        req.body,
        req.user.isModerator
      );

      return success(res, post, "Post mis à jour");
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const userId = req.user.id;

      await PostService.deletePost(
        req.params.postId,
        userId,
        req.user.isModerator
      );

      return success(res, null, "Post supprimé");
    } catch (err) { next(err); }
  }

  async getOne(req, res, next) {
    try {
      const post = await PostService.getPostById(req.params.postId);
      return success(res, post);
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const posts = await PostService.getPosts(page, limit);
      return success(res, posts);
    } catch (err) { next(err); }
  }

  async uploadFiles(req, res, next) {
    try {
      const postId = req.params.postId;

      const attachments = [];
      for (const file of req.files) {
        const att = await AttachmentService.addAttachment(postId, file);
        attachments.push(att);
      }

      return success(res, attachments, "Fichiers ajoutés");
    } catch (err) { next(err); }
  }

  async deleteFile(req, res, next) {
    try {
      await AttachmentService.deleteAttachment(req.params.attachmentId);
      return success(res, null, "Fichier supprimé");
    } catch (err) { next(err); }
  }
}

export default new PostController();
