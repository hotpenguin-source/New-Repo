const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/room/:id", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

/* =========================
   SOCKET ROOMS
========================= */
io.on("connection", (socket) => {
  const roomId = socket.handshake.query.roomId;

  if (!roomId) {
    socket.disconnect();
    return;
  }

  socket.join(roomId);

  function updateUsers() {
    const room = io.sockets.adapter.rooms.get(roomId);
    const count = room ? room.size : 0;

    io.to(roomId).emit("room-users", count);
  }

  updateUsers();

  socket.on("offer", (offer) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    setTimeout(updateUsers, 200);
  });
});

server.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Server running");
});