const { Server } = require("socket.io");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const Driver = require("../app/modules/driver/driver.model");
const User = require("../app/modules/auth/auth.model");
const Conversation = require("../app/modules/conversation/conversation.model");

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

    // set online user---------------------------
    onlineUser.add(currentUserId);
    // send to the client-----------------
    io.emit("onlineUser", Array.from(onlineUser));

    // message page-------------------------------------------------------
    socket.on("message-page", async (id) => {
      console.log("received userid for message page", id);
      let userDetails;
      const driverUserDetails = await Driver.findById(id);

      if (driverUserDetails) {
        userDetails = driverUserDetails;
      }
      const dentalUserDetails = await User.findById(id);

      if (dentalUserDetails) {
        userDetails = dentalUserDetails;
      }
      if (userDetails) {
        const payload = {
          _id: userDetails._id,
          name: userDetails.name,
          profile_image: userDetails?.profile_image,
          online: onlineUser.has(id),
        };
        socket.emit("message-user", payload);
      } else {
        console.log("User not found");
      }
      //get previous message----------------------------------------
      const getConversationMessage = await Conversation.findOne({
        $or: [
          { sender: currentUserId, receiver: id },
          { sender: id, receiver: currentUserId },
        ],
      }).sort({ updatedAt: -1 });

      console.log("previous conversation message", getConversationMessage);

      socket.emit("message", getConversationMessage?.messages || []);
    });

    // new message----------------------------------------------
    socket.on("new-message", async (data) => {
      // console.log(data);
      let conversation = await Conversation.findOne({
        $or: [
          { sender: data?.sender, receiver: data?.receiver },
          { sender: data?.receiver, receiver: data?.sender },
        ],
      });
      console.log("new conversatin", conversation);
      // if conversation is not available then create a new conversation---------------
      if (!conversation) {
        conversation = await Conversation.create({
          sender: data?.sender,
          receiver: data?.receiver,
        });
      }
      const messageData = {
        msgByUserId: data?.msgByUserId,
        text: data?.text,
      };
      // update the conversaton---------------------------
      const updateConversation = await Conversation.updateOne(
        {
          _id: conversation?._id,
        },
        {
          $push: { messages: messageData },
        }
      );

      // get conversation message -----------------------------------------
      const getConversationMessage = await Conversation.findOne({
        $or: [
          { sender: data?.sender, receiver: data?.receiver },
          { sender: data?.receiver, receiver: data?.sender },
        ],
      });

      // send to the client side -----------------------------------------------------
      io.to(data?.sender).emit(
        "message",
        getConversationMessage?.messages || []
      );
      io.to(data?.receiver).emit(
        "message",
        getConversationMessage?.messages || []
      );
    });

    // Disconnect user
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

module.exports = socket;
