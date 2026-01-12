import { Router } from "express";
import UsersController from "./users.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import { updateUserSchema } from "./users.validator.js";
import { auth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/requirePermission.js";

const router = Router();

router.get(
  "/",
  auth(),
  asyncHandler(UsersController.getAllUsers)
);

router.get(
  "/:userId",
  auth(),
  asyncHandler(UsersController.getUser)
);

router.put(
  "/:userId",
  auth(),
  validate(updateUserSchema),
  asyncHandler(UsersController.updateUser)
);

router.delete(
  "/:userId",
  auth(),
  asyncHandler(UsersController.deleteUser)
);

export default router;
