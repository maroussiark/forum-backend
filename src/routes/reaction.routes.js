import { Router } from "express";
import ReactionController from "../controllers/reaction.controller.js";
import { auth } from "../middlewares/auth.js";
import { asyncHandler } from "../shared/middlewares/asyncHandler.js";

const router = Router();

router.post("/", auth(), asyncHandler( ReactionController.add));
router.delete("/", auth(), asyncHandler( ReactionController.remove));

export default router;
