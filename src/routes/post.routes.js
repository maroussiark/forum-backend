import { Router } from "express";
import PostController from "../controllers/post.controller.js";
import Upload from "../middlewares/upload.middleware.js";
import { auth } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission("POST_CREATE"),
  Upload.uploadMultiple("files"),
  PostController.create
);

router.get("/", PostController.list);
router.get("/:postId", PostController.getOne);

router.put(
  "/:postId",
  auth(),
  requirePermission("POST_EDIT"),
  PostController.update
);

router.delete(
  "/:postId",
  auth(),
  requirePermission("POST_DELETE"),
  PostController.delete
);

router.post(
  "/:postId/files",
  auth(),
  Upload.uploadMultiple("files"),
  PostController.uploadFiles
);

router.delete(
  "/file/:attachmentId",
  auth(),
  requirePermission("POST_DELETE"),
  PostController.deleteFile
);

export default router;
