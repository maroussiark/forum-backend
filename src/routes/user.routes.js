import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import Upload from "../middlewares/upload.middleware.js";

const router = Router();

router.put("/:id", UserController.updateProfile);
router.put("/:id/password", UserController.updatePassword);
router.put("/:id/avatar", Upload.uploadSingle("avatar"), UserController.updateAvatar);
router.delete("/:id", UserController.delete);

export default router;
