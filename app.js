require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");


mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB Error:", err));

const locationSchema = new mongoose.Schema({
  userId: String,
  latitude: Number,
  longitude: Number,
  timestamp: { type: Date, default: Date.now }
});

const Location = mongoose.model("Location", locationSchema);


const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));


io.on("connection", function(socket) {

  socket.on("send-location", function(data) {
    Location.create({
      userId: socket.id,
      latitude: data.latitude,
      longitude: data.longitude
    });

    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", function() {
    io.emit("user-disconnected", socket.id);
  });
});


app.get("/", function(req, res) {
  res.render("index");
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
