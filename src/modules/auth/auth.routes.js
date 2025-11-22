import { Router } from "express";
import AuthController from "./auth.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema
} from "./auth.validator.js";

const router = Router();

router.post("/register",
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

router.post("/login",
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

router.post("/refresh",
  validate(refreshSchema),
  asyncHandler(AuthController.refresh)
);

export default router;
