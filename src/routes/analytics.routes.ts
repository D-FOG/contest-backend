import express from 'express';
import {
    runAnalytics,
    getTotalUsers,
    getUsersInContest,
    getTapCountsForContest,
    getContestWinner,
    getTodaySignups, 
    getAverageSignups, 
    getUserDetails,
    getHourlySignups,
    getAllUserDetails
} from '../controllers/analytics.controller';

const router = express.Router();
// Route to run all contest analytics
router.get('/run-analytics', runAnalytics);

// Route to get total number of players (users)
router.get('/total-users', getTotalUsers);

// Route to get the number of users in a specific contest
router.get('/users-in-contest/:productCode', getUsersInContest);

// Route to get tap counts for a specific contest
router.get('/tap-counts/:contestId', getTapCountsForContest);

// Route to get the winner of a specific contest
router.get('/contest-winner/:contestId', getContestWinner);


// Route to get today's signups
router.get('/today-signups', getTodaySignups);

// Route to get average signups over a specified number of days
router.get('/average-signups/:days', getAverageSignups);

// Route to get average signups over a specified number of hours
router.get('/hourly-signups/:hours', getHourlySignups);

// Route to get detailed user information by user ID
router.get('/user-details/:userId', getUserDetails);

// Route to get all detailed user information by user ID
router.get('/user-details/', getAllUserDetails);

export default router;
