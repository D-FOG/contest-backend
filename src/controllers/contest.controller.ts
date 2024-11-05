import { Request, Response } from 'express';
import Contest from '../models/contest';
import redisClient from '../config/redis';
import { Server } from 'socket.io';
import multer from 'multer';
import AWS from 'aws-sdk';

// Set up the Redis and Socket.IO instances (assuming io is passed from app.js)
let io: Server;

export const setSocketIo = (socketIoInstance: Server) => {
  io = socketIoInstance;
};

//seting up aws
const s3 = new AWS.S3({
  accessKeyId:process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

//multer setup for uploads
const upload = multer({
  storage: multer.memoryStorage(),
})

// Create Contest Controller
export const createContest = async (req: Request, res: Response) => {
  const {
    productName,
    tags,
    videoUrl,
    referenceUrl,
    goal,
    category,
    campaign,
    startTime,
    imageUrl,
    feedImageUrl,
    currency,
    productCode,
    premium,
    payToken,
    amount,
  } = req.body;

  // Required fields validation
  if (!productName || !category || !campaign) {
    return res.status(400).json({ message: 'Product name, category, and campaign are required' });
  }

  try {
    // Create a new contest in MongoDB
    const newContest = new Contest({
      productName,
      tags,
      videoUrl,
      referenceUrl,
      goal,
      category,
      campaign,
      startTime,
      imageUrl,
      feedImageUrl,
      currency,
      productCode,
      premium,
      payToken,
      amount,
    });

    await newContest.save();

    // Cache the new contest in Redis
    const contestKey = `contest:${newContest._id}`;
    await redisClient.set(contestKey, JSON.stringify(newContest));

    // Emit the new contest to clients via Socket.IO
    io.emit('contest-created', newContest);

    res.status(201).json({ message: 'Contest created successfully', contest: newContest });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ message: 'Error creating contest', error });
  }
};

// Edit Contest Controller
export const editContest = async (req: Request, res: Response) => {
  const { contestId } = req.params;
  const {
    productName,
    tags,
    videoUrl,
    referenceUrl,
    goal,
    category,
    campaign,
    startTime,
    imageUrl,
    feedImageUrl,
    currency,
    productCode,
    premium,
    payToken,
    amount,
  } = req.body;

  // Required fields validation
  if (!productName || !category || !campaign) {
    return res.status(400).json({ message: 'Product name, category, and campaign are required' });
  }

  try {
    // Update the contest in MongoDB
    const updatedContest = await Contest.findByIdAndUpdate(
      contestId,
      {
        productName,
        tags,
        videoUrl,
        referenceUrl,
        goal,
        category,
        campaign,
        startTime,
        imageUrl,
        feedImageUrl,
        currency,
        productCode,
        premium,
        payToken,
        amount,
      },
      { new: true, runValidators: true }
    );

    if (!updatedContest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Save contest update in Redis
    const contestKey = `contest:${contestId}`;
    await redisClient.set(contestKey, global.JSON.stringify(updatedContest));

    // Emit update to clients via Socket.IO
    io.emit('contest-updated', updatedContest);

    res.status(200).json({ message: 'Contest updated successfully', contest: updatedContest });
  } catch (error) {
    console.error('Error updating contest:', error);
    res.status(500).json({ message: 'Error updating contest', error });
  }
};
