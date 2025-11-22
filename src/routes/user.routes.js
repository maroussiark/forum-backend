import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import Upload from "../middlewares/upload.middleware.js";
import { asyncHandler } from "../shared/middlewares/asyncHandler.js";

const router = Router();

router.put("/:id", asyncHandler(UserController.updateProfile));
router.put("/:id/password", asyncHandler(UserController.updatePassword));
router.put("/:id/avatar", Upload.uploadSingle("avatar"), asyncHandler(UserController.updateAvatar));
router.delete("/:id", asyncHandler(UserController.delete));

export default router;
