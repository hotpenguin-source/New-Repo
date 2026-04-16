const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.join("room");

  socket.on("offer", (offer) => {
    socket.to("room").emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.to("room").emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    socket.to("room").emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});