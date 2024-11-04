// src/sockets/index.ts
import { Server } from 'socket.io';
import { broadcastEvent } from './events';

const connectSockets = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('customEvent', (data) => {
      console.log(`Received data: ${data}`);
      broadcastEvent(io, 'customEvent', data);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default connectSockets;
