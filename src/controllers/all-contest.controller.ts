import { Request, Response }  from 'express';
import ContestModel from '../models/contest'; // Mongoose model
import { Server } from 'socket.io';
import redisClient from '../config/redis'; // Redis client
import { getSocketIO } from '../sockets/socket';
import Admin from '../models/user';
// Set up the Redis and Socket.IO instances (assuming io is passed from app.js)
let io: Server;

export const setSocketIo = (socketIoInstance: Server) => {
  io = socketIoInstance;
};

export const toggleContestLock = async (req:Request, res:Response) => {
    try {
        const { contestId } = req.params;
        const { lockStatus } = req.body;

        // First, update MongoDB
        const contest = await ContestModel.findById(contestId);
        
        if (!contest) {
            res.status(404).json({ message: 'Contest not found' });
            return 
        }

        // Update the lock status in MongoDB
        contest.isLocked = lockStatus;
        await contest.save();

        // Now, update Redis with the new contest data
        const contestKey = `contest:${contestId}`;
        await redisClient.set(contestKey, JSON.stringify(contest));

        // Respond to the admin with the updated contest details
        res.status(200).json({
            message: `Contest ${lockStatus ? 'locked' : 'unlocked'} successfully`,
            contest,
        });
    } catch (error) {
        console.error('Error toggling contest lock:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const scheduleContestNotification = async (req:Request, res:Response) => {
    try {
        const { contestId } = req.params;
        const { notify } = req.body;

        // First, fetch the contest from MongoDB
        const contest = await ContestModel.findById(contestId);
        console.log(!contest.isLocked)
        console.log(notify)
        
        if (!contest) {
            res.status(404).json({ message: 'Contest not found' });
            return 
        }

        // Check if contest is unlocked and notify is true
        if (!contest.isLocked && notify) {
            const startTime = new Date(contest.startTime).getTime();
            const currentTime = Date.now();
            const notifyTime = startTime - 30 * 60 * 1000; // 30 minutes before start

            console.log("Contest start time:", new Date(startTime).toLocaleString());
            console.log("Current time:", new Date(currentTime).toLocaleString());
            console.log("Notify time (30 minutes before start):", new Date(notifyTime).toLocaleString());

            if (notifyTime > currentTime) {
                const delay = notifyTime - currentTime;

                // Set a timer to notify players 30 minutes before start
                setTimeout(async () => {
                    const usersJoined = contest.usersJoined;
                    for (const user of usersJoined) {
                        const userKey = `player:${user._id}`;
                        const playerData = await redisClient.get(userKey);

                        if (playerData) {
                            // Parse player data from Redis
                            const parsedPlayerData = JSON.parse(playerData);

                            // Send real-time notification to the player
                            io.to(parsedPlayerData._id.toString()).emit('contestNotification', {
                                contestId: contest._id,
                                message: `Contest "${contest.productName}" is starting soon!`,
                            });
                            console.log(`Notified player ${user.userId} about upcoming contest.`);
                        }
                    }

                    // Notify all admins
                    const admins = await Admin.find();
                    for (const admin of admins) {
                        io.to(admin._id.toString()).emit('adminNotification', {
                            contestId: contest._id,
                            message: `Contest "${contest.productName}" is starting in 30 minutes.`,
                        });
                        console.log(`Notified admin ${admin.username} about the upcoming contest.`);
                    }


                    // Start the countdown for the contest
                    const countdownInterval = setInterval(() => {
                        const timeLeft = startTime - Date.now();

                        // If the contest time has passed, clear the interval
                        if (timeLeft <= 0) {
                        clearInterval(countdownInterval);
                        return;
                        }
                        
                        // Convert timeLeft to minutes and seconds
                        const minutes = Math.floor(timeLeft / 1000 / 60);
                        const seconds = Math.floor((timeLeft / 1000) % 60);

                        // Emit countdown to all users joined in the contest
                        io.to(contest._id.toString()).emit('contestCountdown', {
                        contestId: contest._id,
                        timeLeft: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
                        });
                        console.log(`Sending countdown: ${minutes}:${seconds}`);
                    }, 1000); // Emit countdown every second



                }, delay);
                console.log("Current time:", currentTime);
                console.log("Notify time:", notifyTime);
                console.log("Start time:", startTime);

                res.status(200).json({ message: 'Notification scheduled successfully' });
            } else {
                res.status(400).json({ message: 'Notification time has already passed' });
            }
        } else {
            res.status(400).json({
                message: 'Notification not scheduled. Either contest is locked or notify is false.',
            });
        }
    } catch (error) {
        console.error('Error scheduling notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
