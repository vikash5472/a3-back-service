
const dotenv = require('dotenv');
dotenv.config();

const creditsConfig = {
  SIGNUP_BONUS: parseInt(process.env.CREDITS_SIGNUP_BONUS, 10) || 5,
  PROVIDER_MODE: process.env.PAYMENT_PROVIDER_MODE || 'mock',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  RAZORPAY_ACCOUNT_MODE: process.env.RAZORPAY_ACCOUNT_MODE || 'test',
};

if (creditsConfig.PROVIDER_MODE === 'razorpay') {
  if (!creditsConfig.RAZORPAY_KEY_ID || !creditsConfig.RAZORPAY_KEY_SECRET || !creditsConfig.RAZORPAY_WEBHOOK_SECRET) {
    throw new Error('Razorpay configuration missing. Please provide RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_WEBHOOK_SECRET in your environment.');
  }
}

module.exports = creditsConfig;
