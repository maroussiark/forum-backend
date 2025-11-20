import MessageService from "../../services/message/message.service.js";
import { success } from "../../utils/apiResponse.js";
import { getIO } from "../../sockets/socket.js";

class MessageController {
  async send(req, res, next) {
    try {
      const { conversationId } = req.params;
      const senderId = req.user.id;
      const { content } = req.body;

      const attachmentUrl = req.file
        ? `/uploads/messages/${req.file.filename}`
        : null;

      const msg = await MessageService.sendMessage(
        conversationId,
        senderId,
        content,
        attachmentUrl,
      );

      // envoyer le message en temps réel
      const io = getIO();
      io.to(conversationId).emit("new-message", msg);

      return success(res, msg);
    } catch (err) {
      next(err);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { limit, cursor } = req.query;

      const data = await MessageService.getMessages(
        conversationId,
        limit,
        cursor,
      );
      return success(res, data);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { messageId } = req.params;
      const msg = await MessageService.markAsRead(messageId);
      return success(res, msg, "Message marqué comme lu");
    } catch (err) {
      next(err);
    }
  }
}

export default new MessageController();
