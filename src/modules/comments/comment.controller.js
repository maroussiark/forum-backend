import CommentService from "./comment.service.js";
import { success } from "../../utils/apiResponse.js";

class CommentController {

  async list(req, res) {
    const result = await CommentService.list(req.params.postId,req.user?.id, Number(req.query.skip) || 0, Number(req.query.take) || 20);
    return success(res, result, "Liste des commentaires");
  }
  
  async create(req, res) {
    const result = await CommentService.create(req.user.id, req.body, req.io);
    return success(res, result, "Commentaire ajouté", 201);
  }

  async update(req, res) {
    const result = await CommentService.update(
      req.params.commentId,
      req.user.id,
      req.user.isModerator,
      req.body.content
    );
    return success(res, result, "Commentaire modifié");
  }

  async remove(req, res) {
    await CommentService.remove(
      req.params.commentId,
      req.user.id,
      req.user.isModerator
    );
    return success(res, null, "Commentaire supprimé");
  }
}

export default new CommentController();
