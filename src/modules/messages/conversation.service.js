import prisma from "../../config/database.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";
import NotificationService from "../notifications/notification.service.js";
import { generateId } from "../../utils/idGenerator.js";
import { notFound } from "../../shared/errors/ApiError.js";

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
      orderBy: [{ createdAt: "asc" }, { id: "desc" }],
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
        senderId: senderId,
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

  async listUserConversations(userId) {
    const conversations = await prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          select: {
            id: true,
            createdAt: true,
            members: {
              include: {
                user: { select: safeUserSelect }
              }
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                sender: { select: safeUserSelect }
              }
            }
          }
        }
      }
    });

    // Format plus propre côté API
    return conversations.map(c => ({
      id: c.conversation.id,
      createdAt: c.conversation.createdAt,
      lastMessage: c.conversation.messages[0] || null,
      members: c.conversation.members.map(m => m.user)
    }));
  }

   async create(creatorId, members) {
    // Ajouter le créateur automatiquement si pas présent
    if (!members.includes(creatorId)) {
      members.push(creatorId);
    }

    // Vérifier existence des users
    const found = await prisma.user.findMany({
      where: { id: { in: members } },
      select: { id: true }
    });

    if (found.length !== members.length)
      throw notFound("Un ou plusieurs utilisateurs n'existent pas");

    const convoId = await generateId("conversation", "CNV-");

    const conversation = await prisma.conversation.create({
      data: {
        id: convoId,
        members: {
          create: members.map((id) => ({
            userId: id
          }))
        }
      },
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return conversation;
  }
}

export default new ConversationService();
