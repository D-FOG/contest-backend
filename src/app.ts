import express from 'express';
import { createClient } from 'redis';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import http from 'http';
import redisClient from './config/redis';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/user.routes';
import cors, { CorsOptions } from 'cors';
import connectSockets from './sockets';

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

const io = new SocketIOServer(server); // Assuming server is your HTTP server

//connect to db
connectDB();

//connect to redis
const connectToRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
};

connectToRedis();
// Initialize Socket.IO
connectSockets(io);

//Routes
app.use('/api', authRoutes);

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});