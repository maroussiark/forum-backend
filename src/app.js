import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import logger from "./shared/logger/logger.js";
import { errorHandler } from "./shared/errors/errorHandler.js";
import { asyncHandler } from "./shared/middlewares/asyncHandler.js";
import path from "path";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/users.routes.js";
import profileRoutes from "./modules/profiles/profile.routes.js";
import postRoutes from "./modules/posts/post.routes.js";
import commentRoutes from "./modules/comments/comment.routes.js";
import reactionRoutes from "./modules/reactions/reaction.routes.js";
import messageRoutes from "./modules/messages/messages.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
  })
);
app.use(cors({ origin: "*", credentials: true }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ Admin
app.use("/api/admin", adminRoutes);

// Health
app.get(
  "/health",
  asyncHandler(async (req, res) => {
    return res.json({ ok: true });
  })
);

app.use(errorHandler);

export default app;
