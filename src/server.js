import http from "http";
import app from "./app.js";
import { setupSockets } from "./sockets/socket.js";

const server = http.createServer(app);

// initialiser websocket
setupSockets(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("API running on port " + PORT));
