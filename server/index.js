const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const socket = require("socket.io");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messageRoute");
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

app.use("/api/messages", messageRoute);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true, // corrected 'Credential' to 'credentials'
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});

console.log(`Server started on ${process.env.PORT}`);
