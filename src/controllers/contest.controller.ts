import { Request, Response } from 'express';
import Contest from '../models/contest';
import redisClient from '../config/redis';
import { Server } from 'socket.io';

// Set up the Redis and Socket.IO instances (assuming io is passed from app.js)
let io: Server;

export const setSocketIo = (socketIoInstance: Server) => {
  io = socketIoInstance;
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
