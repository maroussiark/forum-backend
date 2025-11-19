import { Router } from "express";
import FeedController from "../controllers/feed.controller.js";

const router = Router();

router.get("/", FeedController.list);

export default router;
