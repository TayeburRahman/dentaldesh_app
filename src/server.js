const express = require('express');
const mongoose = require('mongoose');
const { Server } = require('socket.io'); 
const { errorLogger, logger } = require('./shared/logger');
const socket = require('./connection/socket'); // Import the Socket.IO setup

// Create an Express app
const app = require('./app')

// Database connection
const connectDB = require('./connection/connectDB');
const config = require('./config');

// Main function to start the server and set up Socket.IO
async function main() {
  try {
    await connectDB();
    logger.info(`DB Connected Successfully at ${new Date().toLocaleString()}`);

    const port = typeof config.port === 'number' ? config.port : Number(config.port);

    // Start the server
    const server = app.listen(port, config.base_url, () => {
      logger.info(`App listening on http://192.168.10.152:${config.port}`);
    });

    // Set up Socket.IO
    const socketIO = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });
    socket(socketIO);

    // Assign Socket.IO to global for potential use in other parts of the application
    global.io = socketIO;

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled Rejection:', error);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      errorLogger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle termination signals
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      server.close(() => process.exit(0));
    });

  } catch (err) {
    errorLogger.error('Main Function Error:', err);
    process.exit(1);
  }
}

// Start the application
main();
