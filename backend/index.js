const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require('cors'); 
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const colors = require("colors");
dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json()); // to accept json data


// check running stage
// app.get("/", (req, res) => {
//   res.send("API Running!");
// });

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/appfrontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "appfrontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);


// const PORT = process.env.PORT;

// const server = app.listen(
//   PORT,
//   console.log(`Server running on PORT ${PORT}...`.yellow.bold)
// );

const PORT = process.env.PORT || 5000;
const server = app.listen(5000, () => {
    console.log(`Sever Started on PORT ${PORT}`.yellow.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 50000,
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});


io.on("connection", (socket) => {
  console.log("Socket Connected",socket.id);
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // <----------------------chat functionalitioes ---------------------------->az
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  // disconnecting the server 
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
}
)});


const dataToSocketidMap = new Map();
const SocketidtodataMap = new Map();

io.on("connection", (socket1) => {
  console.log(`Socket Connected`, socket1.id);
  socket1.on("room:join", (data) => {
    const { email, roomId } = data;
    dataToSocketidMap.set(email, socket1.id);
    SocketidtodataMap.set(socket1.id, email);
    io.to(roomId).emit("user:joined", { email, id: socket1.id });
    socket1.join(roomId);
    io.to(socket1.id).emit("room:join", data);
    console.log(`roomid:${roomId} email${email}`)
  });

  socket1.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket1.id, offer });
  });

  socket1.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket1.id, ans });
  });

  socket1.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket1.id, offer });
  });

  socket1.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket1.id, ans });
  });
});
  
   