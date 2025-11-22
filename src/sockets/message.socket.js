export function registerMessageSocket(io) {
  io.on("connection", (socket) => {

    socket.on("message:send", (msg) => {
      io.to(msg.conversationId).emit("message:new", msg);
    });

  });
}
