import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});
console.log('Connecting to Redis at:', process.env.REDIS_URL);
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redisClient;
