import { Router } from "express";
import FeedController from "../controllers/feed.controller.js";
import { asyncHandler } from "../shared/middlewares/asyncHandler.js";

const router = Router();

router.get("/",  asyncHandler(FeedController.list));

export default router;
