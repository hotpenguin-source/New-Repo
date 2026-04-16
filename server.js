const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* Serve frontend */
app.use(express.static("public"));

/* =========================
   SOCKET ROOMS
========================= */
io.on("connection", (socket) => {
  const roomId = socket.handshake.query.roomId;

  // ✅ SAFE CHECK (PREVENT RENDER CRASH)
  if (!roomId) {
    console.log("Missing roomId, disconnecting:", socket.id);
    socket.disconnect();
    return;
  }

  socket.join(roomId);

  console.log(`User ${socket.id} joined room: ${roomId}`);

  /* OFFER */
  socket.on("offer", (offer) => {
    socket.to(roomId).emit("offer", offer);
  });

  /* ANSWER */
  socket.on("answer", (answer) => {
    socket.to(roomId).emit("answer", answer);
  });

  /* ICE CANDIDATE */
  socket.on("ice-candidate", (candidate) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});