import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/requirePermission.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import AdminController from "./admin.controller.js";

const router = Router();

router.use(auth(), requirePermission("ADMIN_PANEL"));

router.get("/stats", asyncHandler(AdminController.stats));

// Users
router.get("/users", asyncHandler(AdminController.listUsers));
router.patch("/users/:userId/role", asyncHandler(AdminController.setUserRole));
router.patch("/users/:userId/block", asyncHandler(AdminController.setUserBlock));
router.delete("/users/:userId", asyncHandler(AdminController.deleteUser));

// Moderation posts/comments
router.get("/posts", asyncHandler(AdminController.listPosts));
router.patch("/posts/:postId/visibility", asyncHandler(AdminController.setPostVisibility));

router.get("/comments", asyncHandler(AdminController.listComments));
router.patch(
  "/comments/:commentId/visibility",
  asyncHandler(AdminController.setCommentVisibility)
);

export default router;
