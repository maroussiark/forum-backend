import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import { asyncHandler } from "../shared/middlewares/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(AuthController.register));
router.post("/login", asyncHandler(AuthController.login));
router.post("/refresh", asyncHandler(AuthController.refresh));

export default router;
