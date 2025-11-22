import prisma from "../../config/database.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";

class ConversationService {

  async createConversation(members) {
    return prisma.conversation.create({
      data: {
        members: {
          createMany: {
            data: members.map(id => ({ userId: id }))
          }
        }
      },
      include: { members: true }
    });
  }

  async isMember(conversationId, userId) {
    const member = await prisma.conversationMember.findFirst({
      where: { conversationId, userId }
    });
    return !!member;
  }

  async getMessages(conversationId, cursor, limit) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" }
      ],
      take: limit + 1,
      ...(cursor ? {
        cursor: { id: cursor },
        skip: 1
      } : {}),
      include: { sender: { select: safeUserSelect } }
    });

    let nextCursor = null;
    if (messages.length > limit) {
      const next = messages.pop();
      nextCursor = next.id;
    }

    return { messages, nextCursor };
  }

  async sendMessage(conversationId, userId, content) {
    return prisma.message.create({
      data: {
        conversationId,
        userId,
        content
      },
      include: {
        sender: { select: safeUserSelect }
      }
    });
  }
}

export default new ConversationService();
