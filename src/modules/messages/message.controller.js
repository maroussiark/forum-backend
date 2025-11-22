import ConversationService from "./conversation.service.js";
import { success } from "../../utils/apiResponse.js";

class MessageController {

  async list(req, res) {
    const { cursor, limit } = req.query;

    const result = await ConversationService.getMessages(
      req.params.conversationId,
      cursor,
      Number(limit)
    );

    return success(res, result);
  }

  async send(req, res) {
    const msg = await ConversationService.sendMessage(
      req.body.conversationId,
      req.user.id,
      req.body.content
    );

    req.io.to(req.body.conversationId).emit("message:new", msg);

    return success(res, msg, "Message envoyé");
  }
}

export default new MessageController();
