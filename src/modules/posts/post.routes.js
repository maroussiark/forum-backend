import { Router } from "express";
import PostController from "./post.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/requirePermission.js";
import { uploadAttachments } from "./attachment.upload.js";
import {
  createPostSchema,
  updatePostSchema,
  listPostsSchema
} from "./post.validator.js";

const router = Router();

router.get(
  "/user/:userId",
  auth(),
  asyncHandler(PostController.getByUserId)
);

router.get(
  "/",
  auth(),
  validate(listPostsSchema, "query"),
  asyncHandler(PostController.list)
);

router.get(
  "/:postId",
  asyncHandler(PostController.getById)
);

router.post(
  "/",
  auth(),
  requirePermission("POST_CREATE"),
  uploadAttachments,
  validate(createPostSchema),
  asyncHandler(PostController.create)
);


router.put(
  "/:postId",
  auth(),
  requirePermission("POST_UPDATE"),
  validate(updatePostSchema),
  asyncHandler(PostController.update)
);

router.delete(
  "/:postId",
  auth(),
  requirePermission("POST_DELETE"),
  asyncHandler(PostController.remove)
);

export default router;
