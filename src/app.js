import express from "express";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { secureCors } from "./middlewares/cors.js";
import { sanitize } from "./middlewares/sanitize.js";
import authRoutes from "./routes/auth.routes.js";import userProfileRoutes from "./routes/userProfile.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import reactionRoutes from "./routes/reaction.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import conversationRoutes from "./routes/message/conversation.routes.js";
import messageRoutes from "./routes/message/message.routes.js";


const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", userProfileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/feed",feedRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

app.use(notFound);
app.use(errorHandler);
app.use(secureCors);
app.use(sanitize);

export default app;
