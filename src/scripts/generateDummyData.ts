import mongoose from 'mongoose';
import Contest from '../models/contest';
import Player from '../models/player';
import { faker } from '@faker-js/faker';
import redisClient from '../config/redis';
import dotenv from 'dotenv';

dotenv.config();

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

connectToRedis();

// Helper function for batching inserts
const batchInsert = async (Model, data) => {
    const batchSize = 100;  // Adjust batch size based on available memory
    for (let i = 0; i < data.length; i += batchSize) {
        await Model.insertMany(data.slice(i, i + batchSize));
    }
};

// Function to generate dummy contest data
const generateDummyContests = async (numRecords: number) => {
    const dummyContests = Array.from({ length: numRecords }, () => ({
        productName: faker.commerce.productName(),
        tags: ['promo', 'farm'][Math.floor(Math.random() * 2)],
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
    }));

    try {
        await batchInsert(Contest, dummyContests);
        console.log(`${numRecords} dummy contests created successfully`);

        // Cache these contests in Redis using pipeline
        const pipeline = redisClient.multi();
        dummyContests.forEach(contest => {
            const contestKey = `contest:${contest.productCode}`;
            pipeline.set(contestKey, JSON.stringify(contest));
        });
        await pipeline.exec();
        console.log('Cached contests in Redis');
    } catch (error) {
        console.error('Error generating dummy contests:', error);
    }
};

// Function to generate dummy player data
const generateDummyPlayers = async (numPlayers: number) => {
    const userNames = new Set();
    const dummyPlayers = Array.from({ length: numPlayers }, () => {
        let userName;
        do {
            userName = `${faker.person.firstName()}${faker.number.int({ min: 100, max: 999 })}`;
        } while (userNames.has(userName));  // Ensure unique usernames
        userNames.add(userName);

        return new Player({
            userId: faker.finance.accountNumber(6),
            userName,
            status: ['premium', 'regular'][Math.floor(Math.random() * 2)],
            contestsJoined: [],
            contestsWon: [],
            tapCountRemaining: faker.number.int({ min: 0, max: 10 }),
            referrals: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => faker.internet.email())
        });
    });

    try {
        await batchInsert(Player, dummyPlayers);
        console.log(`${numPlayers} dummy players created successfully`);

        // Cache players in Redis using pipeline
        const pipeline = redisClient.multi();
        dummyPlayers.forEach(player => {
            const playerKey = `player:${player._id}`;
            pipeline.set(playerKey, JSON.stringify(player));
        });
        await pipeline.exec();
        console.log('Cached players in Redis');
    } catch (error) {
        console.error('Error generating dummy players:', error);
    } finally {
        mongoose.connection.close();
        redisClient.quit();
    }
};

// Generate dummy contests and players
(async () => {
    await generateDummyContests(0);
    await generateDummyPlayers(600);
})();
