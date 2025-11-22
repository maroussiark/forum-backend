import ReactionService from "./reaction.service.js";
import { success } from "../../utils/apiResponse.js";

class ReactionController {
  async react(req, res) {
    const result = await ReactionService.react(req.user.id, req.body);
    return success(res, result, "Réaction enregistrée");
  }

  async remove(req, res) {
    await ReactionService.remove(
      req.params.reactionId,
      req.user.id,
      req.user.isModerator
    );
    return success(res, null, "Réaction supprimée");
  }
}

export default new ReactionController();
