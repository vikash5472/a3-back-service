
const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreditPlan',
      required: true,
    },
    planSnapshot: {
      code: String,
      displayName: String,
      priceCurrency: String,
      priceMinor: Number,
      credits: Number,
    },
    provider: {
      type: String,
      default: 'mock',
    },
    providerOrderId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['CREATED', 'PAID', 'FAILED', 'CANCELED'],
      default: 'CREATED',
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PaymentIntent', paymentIntentSchema);
