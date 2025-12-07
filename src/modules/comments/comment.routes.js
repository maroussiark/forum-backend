import { Router } from "express";
import CommentController from "./comment.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/requirePermission.js";
import {
  createCommentSchema,
  updateCommentSchema
} from "./comment.validator.js";

const router = Router();

router.get(
  "/:postId",
  auth(),
  asyncHandler(CommentController.list)
);

router.post(
  "/",
  auth(),
  requirePermission("COMMENT_CREATE"),
  validate(createCommentSchema),
  asyncHandler(CommentController.create)
);

router.put(
  "/:commentId",
  auth(),
  requirePermission("COMMENT_UPDATE"),
  validate(updateCommentSchema),
  asyncHandler(CommentController.update)
);

router.delete(
  "/:commentId",
  auth(),
  requirePermission("COMMENT_DELETE"),
  asyncHandler(CommentController.remove)
);

export default router;
