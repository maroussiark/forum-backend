import { Router } from "express";
import NotificationController from "./notification.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.get(
  "/",
  auth(),
  asyncHandler(NotificationController.list)
);

router.put(
  "/read/:id",
  auth(),
  asyncHandler(NotificationController.markAsRead)
);

router.put(
  "/read-all",
  auth(),
  asyncHandler(NotificationController.markAllAsRead)
);

export default router;
