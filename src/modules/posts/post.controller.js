import PostService from "./post.service.js";
import FeedService from "./feed.service.js";
import { success } from "../../utils/apiResponse.js";

class PostController {

  async getByUserId(req, res) {
    const posts = await PostService.getPostByUserId(req.params.userId,req.user?.id);
    return success(res, posts);
  }

  async create(req, res) {
    const post = await PostService.create(req.user.id, req.body, req.files);

    return success(res, post, "Post créé", 201);
  }

  async getById(req, res) {
    const post = await PostService.getById(req.params.postId);
    return success(res, post);
  }

  async update(req, res) {
    const updated = await PostService.update(
      req.params.postId,
      req.user.id,
      req.user.isModerator,
      req.body,
    );

    return success(res, updated, "Post mis à jour");
  }

  async remove(req, res) {
    await PostService.remove(
      req.params.postId,
      req.user.id,
      req.user.isModerator,
    );

    return success(res, null, "Post supprimé");
  }

  async list(req, res) {
  // Valeurs avec fallback si aucun query param
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const { categoryId } = req.query;

  const posts = await FeedService.list(
    page,
    limit,
    categoryId,
    req.user?.id
  );

  return success(res, posts);
}
}

export default new PostController();
