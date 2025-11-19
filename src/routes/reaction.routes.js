import { Router } from "express";
import ReactionController from "../controllers/reaction.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.post("/", auth(), ReactionController.add);
router.delete("/", auth(), ReactionController.remove);

export default router;
