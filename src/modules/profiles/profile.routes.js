import { Router } from "express";
import ProfileController from "./profile.controller.js";
import { auth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/requirePermission.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import { updateProfileSchema } from "./profile.validator.js";
import { uploadAvatar } from "./profile.upload.js";

const router = Router();

router.get(
  "/:userId",
  asyncHandler(ProfileController.getProfile)
);

router.put(
  "/:userId",
  auth(),
  requirePermission("PROFILE_UPDATE"),
  uploadAvatar,
  validate(updateProfileSchema),
  asyncHandler(ProfileController.updateProfile)
);

export default router;
