import { Router } from "express";
import ReactionController from "./reaction.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/requirePermission.js";
import { reactionSchema } from "./reaction.validator.js";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission("REACTION_CREATE"),
  validate(reactionSchema),
  asyncHandler(ReactionController.react)
);

router.delete(
  "/:reactionId",
  auth(),
  requirePermission("REACTION_DELETE"),
  asyncHandler(ReactionController.remove)
);

export default router;
