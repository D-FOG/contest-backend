import { Request, Response } from 'express';
import Contest from '../models/contest';
import Player from '../models/player';
import player from '../models/player';

// Analytics functions

// 1. Total number of contests
const getTotalContests = async () => {
  return await Contest.countDocuments();
};

// 2. Contests per category
const getContestsByCategory = async () => {
  const contestsByCategory = await Contest.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  return contestsByCategory;
};

// 3. Revenue generated from contest fees
const getRevenueAnalytics = async () => {
  const revenue = await Contest.aggregate([
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
  ]);
  return revenue[0]?.totalRevenue || 0;
};

// 4. Active vs. completed contests (assuming a `completed` field in schema)
const getActiveCompletedRatio = async () => {
  const activeCount = await Contest.countDocuments({ completed: false });
  const completedCount = await Contest.countDocuments({ completed: true });
  return { active: activeCount, completed: completedCount };
};

// Function to run all analytics
export const runAnalytics = async (req:Request, res:Response) => {
  try {
    const totalContests = await getTotalContests();
    const contestsByCategory = await getContestsByCategory();
    const totalRevenue = await getRevenueAnalytics();
    const activeCompletedRatio = await getActiveCompletedRatio();

    console.log(`Total Contests: ${totalContests}`);
    console.log("Contests by Category:", contestsByCategory);
    console.log(`Total Revenue: ${totalRevenue}`);
    console.log("Active vs. Completed:", activeCompletedRatio);

    if (totalContests && contestsByCategory && totalRevenue && activeCompletedRatio){
        res.status(200).json({ totalContest: totalContests, contestsByCategory: contestsByCategory, totalRevenue: totalRevenue, activeCompletedRatio: activeCompletedRatio});
        return;
    }
  } catch (error) {
    console.error("Error running analytics:", error);
  } 
};

// // Run the analytics
// runAnalytics();


export const getTotalUsers = async (req: Request, res: Response) => {
    try {
        const totalPlayers = await player.countDocuments();
        if (totalPlayers){
            res.status(200).json({ totalUsers: totalPlayers, success: true});
            return;
        }
    }catch (error) {
        res.status(500).json({ message: 'An error ocured', error: error})
    }
    return 
  };

  export const getUsersInContest = async (req:Request, res:Response) => {
    try{
        const { productCode } = req.params
        const contest = await Contest.findById(productCode).populate('usersJoined.userId');
        const usersInContest= contest ? contest.usersJoined.length : 0;
        if (usersInContest != 0){
            res.status(200).json({ contestUsers: usersInContest });
        } else{
            res.status(400).json({ message: 'There are no users in this contest'});
        }
    } catch (error){
        res.status(500).json({ message: 'An error ocured', error: error});
    }
  };

  
  export const getTapCountsForContest = async (req:Request, res:Response) => {
    try{
        const { contestId} = req.params;
        const contest = await Contest.findById(contestId).populate('usersJoined.userId');
        const contestTaps = contest ? contest.usersJoined.map(user => ({
        userId: user.userId,
        tapCountRemaining: user.tapCountRemaining,
        })) : [];

        if (contestTaps){
            res.status(200).json({ tapsCount: contestTaps })
        } else {
            res.status(404).json({ message: 'There are no players in this contest' })
        }
    } catch (error) {
        res.status(500).json({ message: 'An error ocured', error: error});
    }
  };

  export const getContestWinner = async (req:Request, res:Response) => {
    try{
        const { contestId } = req.params;
        const contest = await Contest.findById(contestId).populate('winner');
        if (contest){
            res.status(200).json({ contestWinner: contest});
        } else{
            res.status(404).json({ message: 'There is no winner for this contest'});
        }
    }catch(error){
        res.status(500).json({ message: 'An error ocured', error: error});
    }
  };

  // Controller for getting today's signups
export const getTodaySignups = async (req: Request, res: Response) => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
  
      const todaySignups = await Player.countDocuments({ createdAt: { $gte: startOfDay } });
      res.status(200).json({ todaySignups });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching today\'s signups', error });
    }
  };
  
  // Controller for getting average signups over a period
  export const getAverageSignups = async (req: Request, res: Response) => {
    const { days } = req.params;
  
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));
  
      const totalUsers = await Player.countDocuments({ createdAt: { $gte: startDate } });
      const averageSignups = totalUsers / Number(days);
  
      res.status(200).json({ averageSignups });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching average signups', error });
    }
  };
  
  // Controller for getting detailed user info
  export const getUserDetails = async (req: Request, res: Response) => {
    const { userId } = req.params;
  
    try {
      const user = await Player.findOne({ _id: userId }).populate('contestsJoined contestsWon');
  
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      const userDetails = {
        userId: user.userId,
        userName: user.userName,
        status: user.status,
        totalContestsWon: user.contestsWon.length,
        totalContestsJoined: user.contestsJoined.length,
        referralCount: user.referrals.length,
      };
  
      res.status(200).json({ userDetails });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user details', error });
    }
  };
  export const getAllUserDetails = async (req: Request, res: Response) => {
  
    try {
      const users = await Player.find({}).populate('contestsJoined contestsWon');
  
      if (!users) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      const userDetails = users.map( user => ({
        userId: user.userId,
        userName: user.userName,
        status: user.status,
        totalContestsWon: user.contestsWon.length,
        totalContestsJoined: user.contestsJoined.length,
        referralCount: user.referrals.length,
      }));
  
      res.status(200).json({ userDetails });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user details', error });
    }
  };

  export const getHourlySignups = async (req: Request, res: Response) => {
    const { hours } = req.params; // Assume you pass the time period in hours

    try {
        // Calculate the start date by subtracting the number of hours from the current time
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - Number(hours));  // Adjust for hours instead of days
        console.log(startDate)
        // Count the total users that signed up after the start date
        const totalUsers = await Player.countDocuments({ createdAt: { $gte: startDate } });
        console.log(totalUsers)
        // Calculate the average signups per hour (or minute)
        const averageSignups = totalUsers / Number(hours); // Divide by the number of hours
        console.log(averageSignups)
        res.status(200).json({ averageSignups });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching average signups', error });
    }
};
