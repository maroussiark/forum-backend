import prisma from "../../config/database.js";
import { generateId } from "../../utils/idGenerator.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";

class ConversationService {

  async createConversation(userIds) {
    const id = await generateId("conversation", "CONV-");

    const conversation = await prisma.conversation.create({
      data: {
        id,
        members: {
          create: userIds.map(uid => ({
            userId: uid
          }))
        }
      },
      include: { members: {select : safeUserSelect} }
    });

    return conversation;
  }

  async listUserConversations(userId) {
    return prisma.conversation.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        members: { include: { user: {select : safeUserSelect} } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
}

export default new ConversationService();
