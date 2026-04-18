const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.join("main");

  /* 🔥 READY */
  socket.on("ready", async () => {
    const room = io.sockets.adapter.rooms.get("main");
    const numClients = room ? room.size : 0;

    console.log("Users in room:", numClients);

    if (numClients === 2) {
      console.log("Starting call...");
      io.to("main").emit("start-call");
    }
  });

  /* SIGNALING */
  socket.on("offer", (offer) => {
    socket.to("main").emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.to("main").emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    socket.to("main").emit("ice-candidate", candidate);
  });

  /* SYNC CAMERA */
  socket.on("camera-status", (data) => {
    socket.to("main").emit("camera-status", data);
  });

  /* SYNC MIC */
  socket.on("mic-status", (data) => {
    socket.to("main").emit("mic-status", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});