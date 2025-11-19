import ReactionService from "../services/reaction.service.js";
import { success } from "../utils/apiResponse.js";

class ReactionController {

  async add(req, res, next) {
    try {
      const data = await ReactionService.addReaction(req.user.id, req.body);
      return success(res, data, "Réaction ajoutée", 201);
    } catch (err) { next(err); }
  }

  async remove(req, res, next) {
    try {
      await ReactionService.removeReaction(
        req.user.id,
        req.body.postId,
        req.body.commentId
      );

      return success(res, null, "Réaction supprimée");
    } catch (err) { next(err); }
  }
}

export default new ReactionController();
