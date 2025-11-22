import prisma from "../../config/database.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";
import NotificationService from "../notifications/notification.service.js";
class ConversationService {
  async joinConversation(conversationId, userId, io) {
    await prisma.conversationMember.create({
      data: { conversationId, userId },
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const members = await prisma.conversationMember.findMany({
      where: { conversationId },
    });

    for (const m of members) {
      await NotificationService.notify(
        m.userId,
        userId,
        "CONVERSATION_JOINED",
        "Nouveau membre",
        `${profile.fullName} a rejoint la conversation`,
        conversationId,
        "CONVERSATION",
        io,
      );
    }

    return true;
  }

  async createConversation(members) {
    return prisma.conversation.create({
      data: {
        members: {
          createMany: {
            data: members.map((id) => ({ userId: id })),
          },
        },
      },
      include: { members: true },
    });
  }

  async isMember(conversationId, userId) {
    const member = await prisma.conversationMember.findFirst({
      where: { conversationId, userId },
    });
    return !!member;
  }

  async getMessages(conversationId, cursor, limit) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      include: { sender: { select: safeUserSelect } },
    });

    let nextCursor = null;
    if (messages.length > limit) {
      const next = messages.pop();
      nextCursor = next.id;
    }

    return { messages, nextCursor };
  }

  async sendMessage(conversationId, senderId, content, io) {
    const members = await prisma.conversationMember.findMany({
      where: { conversationId },
    });

    const message = await prisma.message.create({
      data: {
        conversationId,
        userId: senderId,
        content,
      },
      include: {
        sender: { select: safeUserSelect },
      },
    });

    const senderProfile = await prisma.userProfile.findUnique({
      where: { userId: senderId },
    });

    for (const member of members) {
      if (member.userId !== senderId) {
        await NotificationService.notify(
          member.userId,
          senderId,
          "MESSAGE_RECEIVED",
          "Nouveau message",
          `${senderProfile.fullName} vous a envoyé un message`,
          conversationId,
          "CONVERSATION",
          io,
        );
      }
    }

    io.to(conversationId).emit("message:new", message);
    return message;
  }
}

export default new ConversationService();
