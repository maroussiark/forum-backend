import prisma from "../../config/database.js";
import { generateId } from "../../utils/idGenerator.js";

class MessageService {

  async sendMessage(conversationId, senderId, content, attachmentUrl) {
    const id = await generateId("message", "MSG-");

    return prisma.message.create({
      data: {
        id,
        conversationId,
        senderId,
        content,
        attachmentUrl
      },
      include: {
        sender: true
      }
    });
  }

  async getMessages(conversationId, limit = 20, cursor = null) {
    const query = {
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      include: { sender: true }
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1;
    }

    const messages = await prisma.message.findMany(query);

    const nextCursor = messages.length ? messages[messages.length - 1].id : null;

    return { messages, nextCursor };
  }

  async markAsRead(messageId) {
    return prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() }
    });
  }
}

export default new MessageService();
