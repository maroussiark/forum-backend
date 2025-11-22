export function registerProfileSocket(io) {
  io.on("connection", (socket) => {
    socket.on("profile:updated", (data) => {
      io.emit("profile:updated", data);
    });
  });
}
