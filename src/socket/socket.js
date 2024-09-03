const { Server } = require('socket.io');

const socket = (io) => {
  logger.info(`DB ccc Successfully at ${new Date().toLocaleString()}`);
  io.on('connection', (socket) => {
    console.log('👤 A user connected successfully',+ io.id);
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
