import CommentService from "../services/comment.service.js";
import { success } from "../utils/apiResponse.js";

class CommentController {

  async add(req, res, next) {
    try {
      const data = await CommentService.addComment(req.user.id, req.body);
      return success(res, data, "Commentaire ajouté", 201);
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const data = await CommentService.updateComment(
        req.params.commentId,
        req.user.id,
        req.body.content,
        req.user.isModerator
      );

      return success(res, data, "Commentaire mis à jour");
    } catch (err) { next(err); }
  }

  async remove(req, res, next) {
    try {
      await CommentService.deleteComment(
        req.params.commentId,
        req.user.id,
        req.user.isModerator
      );

      return success(res, null, "Commentaire supprimé");
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const { postId } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const data = await CommentService.getComments(postId, page, limit);
      return success(res, data);
    } catch (err) { next(err); }
  }
}

export default new CommentController();
