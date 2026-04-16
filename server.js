const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* Serve frontend */
app.use(express.static("public"));

/* IMPORTANT: fix /room route (prevents Cannot GET issues if used later) */
app.get("/room/:id", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

/* =========================
   SOCKET (SINGLE ROOM ONLY)
========================= */
io.on("connection", (socket) => {
  const roomId = socket.handshake.query.roomId;

  if (roomId !== "main") {
    socket.disconnect();
    return;
  }

  socket.join("main");

  console.log(`User joined main room: ${socket.id}`);

  socket.on("offer", (offer) => {
    socket.to("main").emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.to("main").emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    socket.to("main").emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User left:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});