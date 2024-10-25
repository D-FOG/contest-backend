import express from 'express';
import { createClient } from 'redis';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import http from 'http';
import redisClient from './utils/redis';
import dotenv from 'dotenv';
import connectDB from './utils/db';
import authRoutes from './routes/user.routes';
import cors, { CorsOptions } from 'cors';

dotenv.config();

const app =  express();
app.use(express.json());

//allow urls for cors
const allowedOrigins = [
  'http://localhost:3000',
  'https://contest-dash.vercel.app'
]

const CorsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new global.Error('not allowed by Cors'), false);
    }
  },
  credentials: true,
}
 
app.use(cors(CorsOptions));
app.use('/auth', authRoutes);

const server = http.createServer(app);

const io = new Server(server); // Assuming server is your HTTP server

const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

// Event subscription: listen for messages from Redis and broadcast to WebSocket clients
subClient.subscribe('admin-events', (message) => {
  io.emit('admin-event', message);
  console.log('Event broadcasted to admin clients:', message);
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Admin user connected via WebSocket:', socket.id);

  socket.on('subscribeToEvent', (event) => {
    console.log(`Admin subscribed to ${event}`);
    // Here, handle any specific event subscriptions if needed
  });

  socket.on('disconnect', () => {
    console.log('Admin user disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;

connectDB();
server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});