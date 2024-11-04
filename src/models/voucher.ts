import crypto from "crypto";
import mongoose from 'mongoose'

const VoucherSchema = new mongoose.Schema(
  {
    contestId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    productCode: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    voucherCurrency: {
      type: String,
      default: 'PAY',
    },
    productName: {
      type: String,
      required: true,
    },
    reason: String,
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    referenceURL: {
      type: String,
      required: false,
      default: 'https://shop100.co'
    },
    isWinner: {
      type: Boolean,
      required: true,
      default: false,
    },
    code: {
      type: String,
      unique: true,
      default: function () {
        let code = 'CV'
        for (let i = 0; i < 6; i++) {
          code += crypto.randomInt(0, 10)
        }
        return code
      },
    },
  },
  {
    timestamps: true,
  },
)

const VoucherModel = mongoose.model('Voucher', VoucherSchema)
export default VoucherModel
