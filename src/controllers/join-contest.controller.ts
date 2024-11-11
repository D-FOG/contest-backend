import { Request, Response } from 'express';
import ContestModel from '../models/contest';
import Player from '../models/player';
import redisClient from '../config/redis';

export const joinContest = async (req: Request, res: Response) => {
  try {
    const { contestId } = req.params;
    const { userId } = req.body; // Assuming userId is passed in the request body

    console.log(contestId);
    // Fetch the contest from MongoDB
    const contest = await ContestModel.findById(contestId);
    if (!contest) {
      res.status(404).json({ message: 'Contest not found' });
      return;
    }

    //check If user exists as player
    const user = await Player.findById(userId);
    if (!user){
        res.status(404).json({ message: 'User is not a poayer'});
        return;
    }

    // Check if the contest is locked
    if (contest.isLocked) {
      res.status(400).json({ message: 'Contest is currently locked.' });
      return;
    }

    // Check if the user has already joined
    const userAlreadyJoined = contest.usersJoined.some(
      (user) => user.userId.toString() === userId
    );
    if (userAlreadyJoined) {
      res.status(400).json({ message: 'User already joined the contest.' });
      return;
    }

    // Add the user to the contest with default taps
    contest.usersJoined.push({ userId, tapCountRemaining: 10 });
    await contest.save();

    // Update the contest in Redis
    const contestKey = `contest:${contestId}`;
    await redisClient.set(contestKey, JSON.stringify(contest));

    // Respond with success message
    res.status(200).json({
      message: 'User successfully joined the contest.',
      contest,
    });
  } catch (error) {
    console.error('Error joining contest:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
