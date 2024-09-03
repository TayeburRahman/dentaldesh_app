const { Server } = require('socket.io');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');



// online user
const onlineUser = new Set();
const socket = (io) => {
  io.on('connection', async(socket) => {
    const token = socket.handshake.auth.token;
  console.log(token);
  const currentUser = await getUserDetailsFromToken(token);
  const currentUserId = currentUser?._id.toString();
  console.log(currentUserId)
  // create room -----------
  socket.join(currentUserId)

  // set online user
  onlineUser.add(currentUserId);
  // send to the client
  io.emit('onlineUser', Array.from(onlineUser));
  
    // Disconnect user
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

module.exports = socket;
