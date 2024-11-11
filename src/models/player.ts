import mongoose, { Schema, Document } from 'mongoose';

interface Player extends Document {
  userId: string;
  status: 'premium' | 'regular';
  contestsJoined: mongoose.Types.ObjectId[];
  contestsWon: mongoose.Types.ObjectId[];
  tapCountRemaining: number;
  referrals: string[];
}

const playerSchema = new Schema<Player>({
  userId: { type: String, unique: true, required: true },
  status: { type: String, enum: ['premium', 'regular'], required: true },
  contestsJoined: [{ type: Schema.Types.ObjectId, ref: 'Contest' }],
  contestsWon: [{ type: Schema.Types.ObjectId, ref: 'Contest' }],
  tapCountRemaining: { type: Number, default: 10 },
  referrals: [{ type: String }],
},{ timestamps: true });

export default mongoose.model<Player>('Player', playerSchema);
