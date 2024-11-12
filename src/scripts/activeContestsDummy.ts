import Contest from '../models/contest';
import Player from '../models/player';
import mongoose from 'mongoose';

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

// Simulate a contest with a countdown and tap limit
const simulateContest = async (numPlayers: number) => {
  try {
    // Step 1: Select a random unlocked contest
    const contest = await Contest.findOne({ isLocked: false });
    if (!contest) {
      console.log('No unlocked contest available.');
      return;
    }
    
    // Step 2: Select and add random users to the contest
    const players = await Player.aggregate([{ $sample: { size: numPlayers } }]);
    const playersWithTaps = players.map((player) => ({
        userId: player._id,
        tapCountRemaining: 10, // Initial taps for each user
      }));
  
      // Convert playersWithTaps into Mongoose documents
      contest.usersJoined.splice(0, contest.usersJoined.length);

      playersWithTaps.forEach((playerData) => {
        contest.usersJoined.push({
          userId: playerData.userId,
          tapCountRemaining: playerData.tapCountRemaining,
        });
      });
      await contest.save();
    console.log(`Contest ${contest.productName} started with ${numPlayers} players`);

    // Step 3: Simulate taps and countdown
    let countdown = 10; // Countdown starts at 10 seconds
    let lastTapUser = null;

    const intervalId = setInterval(async () => {
      if (countdown <= 0) {
        clearInterval(intervalId);
        
        // Step 4: Declare the winner
        if (lastTapUser) {
          contest.winner = lastTapUser.userId;
          contest.completed = true;
          await contest.save();
          console.log(`Contest ended! Winner: ${lastTapUser.userId}`);
        } else {
          console.log('Contest ended with no winner.');
        }
        return;
      }

      // Randomly pick a player to tap
      const tappingPlayer = playersWithTaps[Math.floor(Math.random() * playersWithTaps.length)];

      if (tappingPlayer.tapCountRemaining > 0) {
        // Deduct a tap and reset countdown
        tappingPlayer.tapCountRemaining -= 1;
        lastTapUser = tappingPlayer;
        countdown = 10; // Reset countdown on tap
        console.log(`Player ${tappingPlayer.userId} tapped. Remaining taps: ${tappingPlayer.tapCountRemaining}`);
        
        // Update tap count in the database
        await Contest.updateOne(
          { _id: contest._id, 'usersJoined.userId': tappingPlayer.userId },
          { $set: { 'usersJoined.$.tapCountRemaining': tappingPlayer.tapCountRemaining } }
        );
      } else {
        console.log(`Player ${tappingPlayer.userId} has no taps remaining.`);
      }

      countdown -= 1; // Decrement countdown each second
      console.log(`Countdown: ${countdown} seconds`);
    }, 1000); // Simulate each second
  } catch (error) {
    console.error('Error simulating contest:', error);
  }
};

// Example usage
simulateContest(5); // Run with a fixed number of 5 players
