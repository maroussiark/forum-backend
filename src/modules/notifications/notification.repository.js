import prisma from "../../config/database.js";

class NotificationRepository {

  async create(data) {
    return prisma.notification.create({ data });
  }

  async list(userId, page, limit) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            userProfiles: {
              select: { fullName: true, avatarUrl: true }
            }
          }
        }
      }
    });
  }

  async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true }
    });
  }
}

export default new NotificationRepository();
