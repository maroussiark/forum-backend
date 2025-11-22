import NotificationService from "./notification.service.js";
import { success } from "../../utils/apiResponse.js";

class NotificationController {

  async list(req, res) {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const notifications = await NotificationService.list(req.user.id, page, limit);
    return success(res, notifications);
  }

  async markAsRead(req, res) {
    await NotificationService.markAsRead(
      req.params.id,
      req.user.id
    );

    return success(res, null, "Notification marquée comme lue");
  }

  async markAllAsRead(req, res) {
    await NotificationService.markAllAsRead(req.user.id);
    return success(res, null, "Toutes les notifications sont marquées comme lues");
  }
}

export default new NotificationController();
