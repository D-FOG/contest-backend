import mongoose from 'mongoose'

const ContestSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      unique: true,
    },
    minParticipants: {
      type: Number,
      required: true,
      default: 10,
    },
    contestFee: {
      type: Number,
      default: 0,
      required: false,
    },
    private: {
      type: Boolean,
      required: true,
      default: false,
    },
    productName: {
      type: String,
      required: true,
    },
    referenceURL: {
      type: String,
      required: false,
      default: null,
    },
    imageURL: {
      type: String,
      required: false,
      default: null
    },
    currency: {
      type: String,
      required: true,
    },
    contestFilled: {
      type: Boolean,
      default: false,
    },
    premium: {
      type: Boolean,
      required: false,
      default: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    likes: {
      type: Array,
      default: [],
    },
    // Might not need the tapData field
    // tapData: {
    //   type: Array,
    //   required: false,
    // },
    gameData: {
      type: Array,
      required: false,
    },
    supporters: {
      type: Array,
      // default: [],
      required: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
    },
    isLocked: {
      required: true,
      type: Boolean,
      default: true,
    },
    startTime: {
      type: Date,
      required: true,
      // default: null
    },
    // an array of that describe what a contest is about. e.g: GEM, farm
    tags: {
      type: Array,
      required: true,
      default: [],
    },
    searchIndex: {
      type: String,
      required: false,
    },
    adPlacementFee: {
      type: Number,
      required: false,
      default: 0,
    },
    feedImageURL: {
      type: String,
      required: false,
    },
    isPayToken: {
      type: Boolean,
      default: false
    },
    referralBonus: {
      type: Number,
      required: false,
    },
    moreTapsLimit: {
      type: Number,
      default: 3
    }
  },
  { timestamps: true },
)

// Pre-save middleware to replace spaces with hyphens in searchIndex
ContestSchema.pre('save', function (next) {
  if (this.searchIndex) {
    this.searchIndex = this.searchIndex.replace(/\s+/g, '-')
  }
  next()
})

const ContestModel = mongoose.model('Contest', ContestSchema)

export default ContestModel
