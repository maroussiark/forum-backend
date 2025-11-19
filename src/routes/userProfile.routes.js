import { Router } from "express";
import UserProfileController from "../controllers/userProfile.controller.js";
import Upload from "../middlewares/upload.middleware.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get("/:userId", auth(), UserProfileController.getProfile);
router.put("/:userId", auth(), UserProfileController.updateProfile);
router.put("/:userId/avatar", auth(), Upload.uploadSingle("avatar"), UserProfileController.updateAvatar);
router.get("/", auth(), UserProfileController.search);

export default router;
