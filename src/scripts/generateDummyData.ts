import mongoose from 'mongoose';
import Contest from '../models/contest'; // Adjust the path if needed
import Player from '../models/player';
import { faker } from '@faker-js/faker';
import redisClient from '../config/redis';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
console.log(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB connection error:', error));

const connectToRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
};

connectToRedis()

// Function to generate dummy contest data
const generateDummyContests = async (numRecords: number) => {
  const dummyContests = [];

  for (let i = 0; i < numRecords; i++) {
    const newContest = new Contest({
      productName: faker.commerce.productName(),
      tags: ['promo', 'farm'][Math.floor(Math.random() * 2)], // Randomly choose a tag
      referenceUrl: faker.internet.url(),
      goal: faker.number.int({ min: 100, max: 1000 }),
      category: ['product crypto game', 'another category'][Math.floor(Math.random() * 2)],
      campaign: ['gadgets and accessories', 'laptop and computers', 'apple products', 'crypto games'][Math.floor(Math.random() * 4)],
      startTime: faker.date.soon(),
      currency: ['USD', 'NGN'][Math.floor(Math.random() * 2)],
      productCode: faker.finance.accountNumber(6),
      premium: faker.datatype.boolean(),
      payToken: faker.finance.currencyCode(),
      amount: faker.number.float({ min: 10, max: 1000 }),
      imageUrl: faker.image.url(),
      videoUrl: faker.internet.url(),
      feedImageUrl: faker.image.url()
    });
    dummyContests.push(newContest);
  }

  try {
    // Insert all dummy data at once (bulk insert)
    await Contest.insertMany(dummyContests);
    console.log(`${numRecords} dummy contests created successfully`);

    // Cache these contests in Redis
    for (const contest of dummyContests) {
      const contestKey = `contest:${contest._id}`;
      console.log(contestKey);
      await redisClient.set(contestKey, JSON.stringify(contest));
    }
  } catch (error) {
    console.error('Error generating dummy data:', error);
  }
};

// Function to generate dummy player data
const generateDummyPlayers = async (numPlayers: number) => {
    const dummyPlayers = [];
  
    for (let i = 0; i < numPlayers; i++) {
      const newPlayer = new Player({
        userId: faker.finance.accountNumber(6),
        status: ['premium', 'regular'][Math.floor(Math.random() * 2)],
        contestsJoined: [],
        contestsWon: [],
        tapCountRemaining: faker.number.int({ min: 0, max: 10 }),
        referrals: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => faker.internet.email())
      });
      dummyPlayers.push(newPlayer);
    }
  
    try {
      await Player.insertMany(dummyPlayers);
      console.log(`${numPlayers} dummy players created successfully`);
  
      for (const player of dummyPlayers) {
        const playerKey = `player:${player._id}`;
        console.log(playerKey);
        await redisClient.set(playerKey, JSON.stringify(player));
      }
    } catch (error) {
      console.error('Error generating dummy players:', error);
    } finally {
      mongoose.connection.close();
      redisClient.quit();
    }
  };



// Generate 100 dummy contests and 50 dummy players (or any number you choose)
(async () => {
    await generateDummyContests(0);
    await generateDummyPlayers(50);
  })();