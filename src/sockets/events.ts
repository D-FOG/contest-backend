// src/sockets/events.ts
import { Server } from 'socket.io';

export const broadcastEvent = (io: Server, event: string, data: any) => {
  io.emit(event, data);
};
