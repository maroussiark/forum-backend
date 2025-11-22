import { Router } from "express";
import UserProfileController from "../controllers/userProfile.controller.js";
import Upload from "../middlewares/upload.middleware.js";
import { auth } from "../middlewares/auth.js";
import { asyncHandler } from "../shared/middlewares/asyncHandler.js";

const router = Router();

router.get("/:userId", auth(), asyncHandler(UserProfileController.getProfile));
router.put("/:userId", auth(), asyncHandler(UserProfileController.updateProfile));
router.put("/:userId/avatar", auth(), Upload.uploadSingle("avatar"), asyncHandler(UserProfileController.updateAvatar));
router.get("/", auth(), asyncHandler(UserProfileController.search));

export default router;
