import { Router } from "express";
import CommentController from "../controllers/comment.controller.js";
import { auth } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission("COMMENT_CREATE"),
  CommentController.add
);

router.put(
  "/:commentId",
  auth(),
  requirePermission("COMMENT_EDIT"),
  CommentController.update
);

router.delete(
  "/:commentId",
  auth(),
  requirePermission("COMMENT_DELETE"),
  CommentController.remove
);

router.get(
  "/post/:postId",
  CommentController.list
);

export default router;
