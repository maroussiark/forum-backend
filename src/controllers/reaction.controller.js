import ReactionService from "../services/reaction.service.js";
import { success } from "../utils/apiResponse.js";

class ReactionController {
  async add(req, res) {
    const data = await ReactionService.addReaction(req.user.id, req.body);
    return success(res, data, "Réaction ajoutée", 201);
  }

  async remove(req, res) {
    await ReactionService.removeReaction(
      req.user.id,
      req.body.postId,
      req.body.commentId,
    );

    return success(res, null, "Réaction supprimée");
  }
}

export default new ReactionController();
