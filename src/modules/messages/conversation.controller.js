import ConversationService from "./conversation.service.js";
import { success } from "../../utils/apiResponse.js";

class ConversationController {
  async create(req, res) {
    const conversation = await ConversationService.create(req.user.id, req.body.members);
    return success(res, conversation, "Conversation créée", 201);
  }

  async list(req, res) {
    return success(res, await ConversationService.list(req.params.conversationId, req.query));
  }

  async listConversations(req, res) {
    const list = await ConversationService.listUserConversations(req.user.id);
    return success(res, list);
  }
}

export default new ConversationController();
