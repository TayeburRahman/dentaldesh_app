const { Server } = require("socket.io");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

// online user
const onlineUser = new Set();
const socket = (io) => {
  io.on("connection", async (socket) => {
    console.log("A user connected");
    const token = socket.handshake.auth.token;
    const currentUser = await getUserDetailsFromToken(token);
    const currentUserId = currentUser?._id.toString();
    console.log(currentUserId);
    // create room -----------
    socket.join(currentUserId);

    // set online user
    onlineUser.add(currentUserId);
    // send to the client
    io.emit("onlineUser", Array.from(onlineUser));

    // message page
    socket.on("message-page", async (id) => {
      console.log("received userid for message page", id);
    });

    // Disconnect user
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

module.exports = socket;
