import express from 'express';
import { createClient } from 'redis';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import http from 'http';
import redisClient from './utils/redis';
import dotenv from 'dotenv';

dotenv.config();

const app =  express();

const server = http.createServer(app);

const io = new Server(server); // Assuming server is your HTTP server

const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


server.listen(3000, () => {
    console.log('Server is running on port 3000');
  });