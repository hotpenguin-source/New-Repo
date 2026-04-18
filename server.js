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

/* ✅ WAITING USERS PER ROOM */
const waiting = {};

io.on("connection", (socket) => {
  const roomId = socket.handshake.query.roomId;

  if (!roomId) {
    socket.disconnect();
    return;
  }

  socket.join(roomId);
  console.log("User connected:", socket.id, "Room:", roomId);

  /* ✅ PAIR USERS */
  socket.on("ready", () => {
    if (!waiting[roomId]) {
      waiting[roomId] = socket.id;
      console.log("Waiting in room:", roomId, socket.id);
    } else {
      const partner = waiting[roomId];

      console.log("Pairing:", partner, socket.id);

      io.to(partner).emit("start-call");
      io.to(socket.id).emit("start-call");

      delete waiting[roomId];
    }
  });

  /* ✅ SIGNALING */
  socket.on("offer", (offer) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  /* UI SYNC */
  socket.on("camera-status", (data) => {
    socket.to(roomId).emit("camera-status", data);
  });

  socket.on("mic-status", (data) => {
    socket.to(roomId).emit("mic-status", data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    console.log("Disconnected:", socket.id);

    if (waiting[roomId] === socket.id) {
      delete waiting[roomId];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});