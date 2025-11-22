import NotificationRepository from "./notification.repository.js";
import { notFound } from "../../shared/errors/ApiError.js";
import { generateId } from "../../utils/idGenerator.js";

class NotificationService {

  async notify(userId, actorId, type, title, message, entityId, entityType, io) {
    const data = {
      id: await generateId("notification", "NTF-"),
      userId,
      actorId,
      type,
      title,
      message,
      entityId,
      entityType
    };

    const notif = await NotificationRepository.create(data);

    // Socket
    if (io) {
      io.to(userId).emit("notification:new", notif);
    }

    return notif;
  }

  async list(userId, page = 1, limit = 20) {
    return NotificationRepository.list(userId, page, limit);
  }

  async markAsRead(notificationId, userId) {
    const updated = await NotificationRepository.markAsRead(notificationId, userId);
    if (!updated) throw notFound("Notification introuvable");
    return updated;
  }

  async markAllAsRead(userId) {
    return NotificationRepository.markAllAsRead(userId);
  }
}

export default new NotificationService();
