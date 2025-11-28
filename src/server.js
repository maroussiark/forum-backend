import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import logger from './shared/logger/logger.js';
import { registerNotificationSocket } from './sockets/notification.socket.js';
import { registerMessageSocket } from './sockets/message.socket.js';
import { registerProfileSocket } from './sockets/profile.socket.js';

const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

globalThis.io = io;

registerNotificationSocket(io);
registerMessageSocket(io);
registerProfileSocket(io);

io.on('connection', (socket) => {
  logger.info(`⚡ Nouveau client Socket connecté : ${socket.id}`);
});

server.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
