import { Router } from "express";
import MessageController from "../../controllers/message/message.controller.js";
import { auth } from "../../middlewares/auth.js";
import Upload from "../../middlewares/upload.middleware.js";

const router = Router();

router.post(
  "/:conversationId",
  auth(),
  Upload.uploadSingle("attachment"),
  MessageController.send
);

router.get("/:conversationId", auth(), MessageController.getMessages);

router.put("/:messageId/read", auth(), MessageController.markAsRead);

export default router;
