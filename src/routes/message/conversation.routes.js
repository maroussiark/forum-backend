import { Router } from "express";
import ConversationController from "../../controllers/message/conversation.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.post("/", auth(), ConversationController.create);
router.get("/", auth(), ConversationController.list);

export default router;
