import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import logger from "./shared/logger/logger.js";
import fs from "fs/promises";
import uploadConfig from './config/upload.config.js';
import { registerNotificationSocket } from "./sockets/notification.socket.js";
import { registerMessageSocket } from "./sockets/message.socket.js";
import { registerProfileSocket } from "./sockets/profile.socket.js";

const PORT = process.env.PORT || 3000;

await Promise.all(
  Object.values(uploadConfig.storage).map((dir) => fs.mkdir(dir, { recursive: true }))
);
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
app.set("io", io);
global.io = io;


registerNotificationSocket(io);
registerMessageSocket(io);
registerProfileSocket(io);

io.on("connection", (socket) => {
  logger.info(`⚡ Nouveau client Socket connecté : ${socket.id}`);
});

server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
