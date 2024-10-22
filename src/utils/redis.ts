import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASS, // Remove this line if not needed
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redisClient;
