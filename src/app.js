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

const app = express();

app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });
  next();
});

app.use((req, res, next) => {
  req.io = global.io || null;
  next();
});

// health
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));

// api
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// 404
app.use(
  /(.*)/,
  asyncHandler((_req, res) => {
    return res.status(404).json({
      status: 404,
      code: "NOT_FOUND",
      message: "Route introuvable"
    });
  })
);

app.use(errorHandler);

export default app;
