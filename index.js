const express = require("express");
const app = express();
const path = require("path");
const index = require("http").createServer(app);
const io = require("socket.io")(index);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

index.listen(port, function() {
  console.log("listening3000");
});

let numUsers = 0;

io.on("connection", socket => {
  let addedUser = false;

  socket.on("new message", data => {
    socket.broadcast.emit("new message", {
      username: socket.username,
      message: data
    });
  });

  socket.on("add user", username => {
    if (addedUser) return;
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit("login", {
      numUsers: numUsers
    });
    socket.broadcast.emit("user joined", {
      username: socket.username,
      numUsers: numUsers
    });
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing", {
      username: socket.username
    });
  });

  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", {
      username: socket.username
    });
  });

  socket.on("disconnect", () => {
    if (addedUser) {
      --numUsers;

      socket.broadcast.emit("user left", {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
