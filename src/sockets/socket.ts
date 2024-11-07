// src/sockets/socket.ts
import { Server } from 'socket.io';

let io: Server;

export const setUpSocketIO = (socketIoInstance: Server) => {
  io = socketIoInstance;

  // Set up connection event listeners
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

// Export a function to get the io instance
export const getSocketIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
