import { Router } from "express";
import AdminController from "./admin.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import prisma from "../../config/database.js";
import {
  listAdminSchema,
  setUserRoleSchema,
  setUserBlockedSchema,
  setVisibilitySchema,
} from "./admin.validator.js";

const router = Router();

router.use(auth());

// expose a lightweight current-user endpoint for the admin frontend to check
// the authenticated user's role without requiring the admin guard
router.get(
  "/me",
  asyncHandler(AdminController.me)
);

// ✅ guard admin (par Role.name)
router.use(async (req, res, next) => {
  const u = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { role: { select: { name: true } } },
  });
  if (!u || u.role.name !== "ADMIN") return res.status(403).json({ message: "Forbidden" });
  next();
});

router.get("/stats", asyncHandler(AdminController.stats));
router.get("/roles", asyncHandler(AdminController.roles));

router.get("/users", validate(listAdminSchema, "query"), asyncHandler(AdminController.listUsers));
router.patch("/users/:userId/role", validate(setUserRoleSchema), asyncHandler(AdminController.setUserRole));
router.patch("/users/:userId/block", validate(setUserBlockedSchema), asyncHandler(AdminController.setUserBlocked));
router.delete("/users/:userId", asyncHandler(AdminController.deleteUser));

router.get("/posts", validate(listAdminSchema, "query"), asyncHandler(AdminController.listPosts));
router.patch("/posts/:postId/visibility", validate(setVisibilitySchema), asyncHandler(AdminController.setPostVisibility));

router.get("/comments", validate(listAdminSchema, "query"), asyncHandler(AdminController.listComments));
router.patch("/comments/:commentId/visibility", validate(setVisibilitySchema), asyncHandler(AdminController.setCommentVisibility));

export default router;
