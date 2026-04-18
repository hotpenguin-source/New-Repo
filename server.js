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

/* 🔥 SIMPLE 2-PERSON PAIRING */
let waitingSocket = null;

io.on("connection", (socket) => {
  const roomId = socket.handshake.query.roomId;

  if (!roomId) {
    socket.disconnect();
    return;
  }

  socket.join(roomId);

  console.log("User connected:", socket.id);

  /* READY → PAIR USERS */
  socket.on("ready", () => {
    if (!waitingSocket) {
      waitingSocket = socket.id;
      console.log("Waiting:", socket.id);
    } else {
      console.log("Pairing:", waitingSocket, socket.id);

      io.to(waitingSocket).emit("start-call");

      waitingSocket = null;
    }
  });

  /* WEBRTC SIGNALING */
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
    if (waitingSocket === socket.id) {
      waitingSocket = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});