const { Server } = require('socket.io');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');

const socket = (io) => {
  io.on('connection', async(socket) => {
    const token = socket.handshake.auth.token;
  console.log(token);
  const currentUser = await getUserDetailsFromToken(token);
  console.log(currentUser)
    // socket.on('join', (userId) => {
    //   socket.join(userId);
    //   console.log(`User ${userId} joined room`);
    // });
    // Disconnect user
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

module.exports = socket;
