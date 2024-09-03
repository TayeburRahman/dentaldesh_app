const { Server } = require('socket.io');

const socket = (io) => {
  io.on('connection', (socket) => {
    const token = socket.handshake.auth.token;
  console.log(token);
  
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
