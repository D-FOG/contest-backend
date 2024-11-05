// import { createClient } from 'redis';

// const redisClient = createClient({
//   url: process.env.REDIS_URL,
// });
// console.log('Connecting to Redis at:', process.env.REDIS_URL);
// redisClient.on('connect', () => {
//   console.log('Connected to Redis');
// });

// redisClient.on('error', (err) => {
//   console.error('Redis error:', err);
// });

// export default redisClient;

import { createClient } from 'redis';

const redisClient = createClient({
    password: 'oQKaOd7akZ8Aehoji8aAfg7RHP4KUMAP',
    socket: {
        host: 'redis-10973.c283.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 10973
    }
});


export default redisClient;
