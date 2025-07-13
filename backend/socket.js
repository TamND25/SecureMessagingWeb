const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

function setupSocket(server, db) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
    console.error("Socket auth failed: jwt must be provided");
    return next(new Error("Authentication error"));
  }
  
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      next();
    } catch (err) {
      console.error("Socket auth failed:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`${socket.user.username} connected (ID: ${socket.user.id})`);

    socket.join(`user:${socket.user.id}`);

    socket.on("send_message", async ({ toUserId, content }) => {
      if (!toUserId || !content) return;

      const message = await db.message.create({
        senderId: socket.user.id,
        receiverId: toUserId,
        content,
      });

      io.to(`user:${toUserId}`).emit("receive_message", {
        from: socket.user.id,
        content,
        createdAt: message.createdAt,
      });
    });

    socket.on("disconnect", () => {
      console.log(`${socket.user.username} disconnected`);
    });
  });
}

module.exports = setupSocket;
