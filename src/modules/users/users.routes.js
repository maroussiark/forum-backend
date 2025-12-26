import { Router } from "express";
import UsersController from "./users.controller.js";
import { auth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { requirePermission } from "../../middlewares/requirePermission.js";

// import robust (évite le "handler must be a function" si export default vs named)
import * as asyncHandlerMod from "../../shared/middlewares/asyncHandler.js";
import * as validateMod from "../../shared/middlewares/validate.js";

import { updateUserSchema } from "./users.validator.js";

const asyncHandler = asyncHandlerMod.asyncHandler ?? asyncHandlerMod.default;
const validate = validateMod.validate ?? validateMod.default;

const router = Router();

if (typeof asyncHandler !== "function") {
  throw new Error("asyncHandler middleware not found (check export in shared/middlewares/asyncHandler.js)");
}
if (typeof validate !== "function") {
  throw new Error("validate middleware not found (check export in shared/middlewares/validate.js)");
}

// GET /api/users  (admin/moderator uniquement)
router.get(
  "/",
  auth(),
  requireRole("ADMIN", "MODERATOR"),
  asyncHandler((req, res) => UsersController.getAllUsers(req, res))
);

// GET /api/users/:userId  (admin/moderator uniquement)
router.get(
  "/:userId",
  auth(),
  requireRole("ADMIN", "MODERATOR"),
  asyncHandler((req, res) => UsersController.getUser(req, res))
);

// PUT /api/users/:userId (permission)
router.put(
  "/:userId",
  auth(),
  requirePermission("PROFILE_UPDATE"),
  validate(updateUserSchema),
  asyncHandler((req, res) => UsersController.updateUser(req, res))
);

// DELETE /api/users/:userId (permission)
router.delete(
  "/:userId",
  auth(),
  requirePermission("USER_DELETE"),
  asyncHandler((req, res) => UsersController.deleteUser(req, res))
);

export default router;
