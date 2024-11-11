// src/models/Analytics.ts
import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema(
  {
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      required: true,
    },
    totalParticipants: {
      type: Number,
      default: 0,
    },
    totalTaps: {
      type: Number,
      default: 0,
    },
    avgTapsPerUser: {
      type: Number,
      default: 0,
    },
    avgContestDuration: {
      type: Number, // Duration in seconds
      default: 0,
    },
    winnersCount: {
      type: Number,
      default: 0,
    },
    tapsDistribution: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        tapsCount: Number,
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AnalyticsModel = mongoose.model('Analytics', AnalyticsSchema);

export default AnalyticsModel;
