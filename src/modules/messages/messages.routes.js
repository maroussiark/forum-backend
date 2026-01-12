import { Router } from "express";
import MessageController from "./message.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/requirePermission.js";
import { sendMessageSchema, messageListSchema } from "./message.validator.js";
import ConversationService from "./conversation.service.js";
import { forbidden } from "../../shared/errors/ApiError.js";
import ConversationController from "./conversation.controller.js";
import { createConversationSchema } from "./conversation.validator.js";

const router = Router();

// Check membership before listing messages
router.post(
  "/conversations",
  auth(),
  requirePermission("CONVERSATION_CREATE"),
  validate(createConversationSchema),
  asyncHandler(ConversationController.create)
);

router.get(
  "/conversations",
  auth(),
  asyncHandler(ConversationController.listConversations)
);

router.get(
  "/:conversationId",
  auth(),
  asyncHandler(async (req, res, next) => {
    const isMember = await ConversationService.isMember(
      req.params.conversationId,
      req.user.id,
    );
    if (!isMember) throw forbidden("Vous n'êtes pas membre de la conversation");
    next();
  }),
  validate(messageListSchema, "query"),
  asyncHandler(MessageController.list),
);

router.post(
  "/send",
  auth(),
  requirePermission("MESSAGE_SEND"),
  validate(sendMessageSchema),
  asyncHandler(MessageController.send),
);

export default router;
