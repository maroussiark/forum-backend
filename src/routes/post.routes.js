import { Router } from "express";
import PostController from "../controllers/post.controller.js";
import Upload from "../middlewares/upload.middleware.js";
import { auth } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { asyncHandler } from "../shared/middlewares/asyncHandler.js";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission("POST_CREATE"),
  Upload.uploadMultiple("files"),
  asyncHandler(PostController.create),
);

router.get("/", asyncHandler(PostController.list));
router.get("/:postId", asyncHandler(PostController.getOne));

router.put(
  "/:postId",
  auth(),
  requirePermission("POST_EDIT"),
  asyncHandler(PostController.update),
);

router.delete(
  "/:postId",
  auth(),
  requirePermission("POST_DELETE"),
  asyncHandler(PostController.delete),
);

router.post(
  "/:postId/files",
  auth(),
  Upload.uploadMultiple("files"),
  asyncHandler(PostController.uploadFiles),
);

router.delete(
  "/file/:attachmentId",
  auth(),
  requirePermission("POST_DELETE"),
  asyncHandler(PostController.deleteFile),
);

export default router;
