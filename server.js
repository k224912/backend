const express = require('express');
const { chats } = require('./data/data');
const dotenv = require("dotenv");
const  connectDB = require("./config/db");
const colors = require("colors")
const userRoutes=require('./routes/userRoutes')
const chatRoutes=require('./routes/chatRoutes')
const messageRoutes=require('./routes/messageRoutes')
const {notFound,errorHandler}= require ('./middleware/errorMiddleware')
const path = require("path");
const cors = require('cors');


dotenv.config();
connectDB();
const app = express();
app.use(cors());


app.use(express.json());///to accept json data
app.get("/",(req,res)=>{
    res.send("API is running succesfully")
});

app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/message',messageRoutes)


//adding two error handling functions
app.use(notFound)
app.use(errorHandler)


const port =  5000
const server=app.listen(port,console.log(`server Started on PORT  5000 ${port}`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,//after this time it will be inactice
  cors: {
    origin: "https://unrivaled-praline-4f2703.netlify.app",//http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {//taking userdata from the frontend
    socket.join(userData._id);//makes a new room for that user 
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {//socket.emit("new message", data);
    var chat = newMessageRecieved.chat;//to see which chat it belongs to

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});