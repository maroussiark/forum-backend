import { Router } from "express";
import CommentController from "../controllers/comment.controller.js";
import { auth } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { asyncHandler } from "../shared/middlewares/asyncHandler.js";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission("COMMENT_CREATE"),
  asyncHandler(CommentController.add),
);

router.put(
  "/:commentId",
  auth(),
  requirePermission("COMMENT_EDIT"),
  asyncHandler(CommentController.update),
);

router.delete(
  "/:commentId",
  auth(),
  requirePermission("COMMENT_DELETE"),
  asyncHandler(CommentController.remove),
);

router.get("/post/:postId", asyncHandler(CommentController.list));

export default router;
