import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";

let io = null;

export const setupSockets = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const user = verifyToken(token);
      socket.user = user;

      next();
    } catch (err) {
      next(err);
    }
  });

  io.on("connection", (socket) => {

    const userId = socket.user.id;

    console.log("User connected:", userId);

    // rejoindre toutes ses conversations
    socket.on("join-conversations", async (conversationIds) => {
      conversationIds.forEach((id) => socket.join(id));
    });

    // envoyer un message
    socket.on("send-message", (data) => {
      const { conversationId, message } = data;

      io.to(conversationId).emit("new-message", {
        conversationId,
        message
      });
    });

    // typing...
    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user-typing", {
        userId,
        conversationId
      });
    });

    // mark as read
    socket.on("read-message", ({ conversationId, messageId }) => {
      socket.to(conversationId).emit("message-read", {
        userId,
        messageId
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
    });
  });
};

export const getIO = () => io;
