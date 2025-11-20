import ConversationService from "../../services/message/conversation.service.js";
import { success } from "../../utils/apiResponse.js";

class ConversationController {

  async create(req, res, next) {
    try {
      const { members } = req.body;
      const conv = await ConversationService.createConversation(members);
      return success(res, conv, "Conversation créée");
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const userId = req.user.id;
      const conversations = await ConversationService.listUserConversations(userId);
      return success(res, conversations);
    } catch (err) { next(err); }
  }
}

export default new ConversationController();
