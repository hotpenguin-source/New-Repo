const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const roomId = socket.handshake.query.roomId || "default";

/* Serve frontend */
app.use(express.static("public"));

/* =========================
   SOCKET ROOMS
========================= */
io.on("connection", (socket) => {
  const roomId = socket.handshake.query.roomId;

  socket.join(roomId);

  console.log("User joined room:", roomId);

  /* OFFER */
  socket.on("offer", (offer) => {
    socket.to(roomId).emit("offer", offer);
  });

  /* ANSWER */
  socket.on("answer", (answer) => {
    socket.to(roomId).emit("answer", answer);
  });

  /* ICE */
  socket.on("ice-candidate", (candidate) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});