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

/* TRACK USERS IN ROOM */
let waitingSocket = null;

io.on("connection", (socket) => {
  const roomId = socket.handshake.query.roomId;

  if (!roomId) {
    socket.disconnect();
    return;
  }

  socket.join(roomId);

  console.log("User joined:", socket.id);

  /* Mark user ready */
  socket.on("ready", () => {
    // If no one is waiting → this user waits
    if (!waitingSocket) {
      waitingSocket = socket.id;
      console.log("User is waiting:", socket.id);
    } else {
      // Someone is already waiting → start call
      console.log("Starting call between:", waitingSocket, socket.id);

      io.to(waitingSocket).emit("start-call");

      waitingSocket = null;
    }
  });

  /* SIGNALING */
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
    if (waitingSocket === socket.id) {
      waitingSocket = null;
    }
  });
});

server.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Server running");
});