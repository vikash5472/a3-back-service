
const mongoose = require('mongoose');

const creditPlanSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    priceCurrency: {
      type: String,
      required: true,
    },
    priceMinor: {
      type: Number,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    sort: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CreditPlan', creditPlanSchema);
