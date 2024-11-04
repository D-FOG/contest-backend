import mongoose, { Document } from 'mongoose';

interface IContest extends Document {
  productName: string;
  tags: string[]; // Array for multiple tags like 'farming' and 'promo'
  videoUrl?: string;
  referenceUrl?: string;
  goal?: string;
  category: string; // Required
  campaign: string; // Required
  startTime?: Date;
  imageUrl?: string;
  feedImageUrl?: string;
  currency?: 'USD' | 'NGN'; // Restricted to USD or NGN
  productCode?: string;
  premium?: boolean;
  payToken?: string;
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContestSchema = new mongoose.Schema<IContest>({
  productName: { type: mongoose.Schema.Types.String, required: true, trim: true },
  tags: { type: [mongoose.Schema.Types.String], default: [] },
  videoUrl: { type: mongoose.Schema.Types.String },
  referenceUrl: { type: mongoose.Schema.Types.String },
  goal: { type: mongoose.Schema.Types.String },
  category: { type: mongoose.Schema.Types.String, required: true, trim: true },
  campaign: { type: mongoose.Schema.Types.String, required: true, trim: true },
  startTime: { type: mongoose.Schema.Types.Date, default: global.Date.now() },
  imageUrl: { type: mongoose.Schema.Types.String },
  feedImageUrl: { type: mongoose.Schema.Types.String },
  currency: {
    type: mongoose.Schema.Types.String,
    enum: ['USD', 'NGN'],
    default: 'USD', // Default currency
  },
  productCode: { type: mongoose.Schema.Types.String },
  premium: { type: mongoose.Schema.Types.Boolean, default: false },
  payToken: { type: mongoose.Schema.Types.String },
  amount: { type: mongoose.Schema.Types.Number, default: 0 },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

// Compile the schema into a model
const Contest = mongoose.model<IContest>('Contest', ContestSchema);

export default Contest;
