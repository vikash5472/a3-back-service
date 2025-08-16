
const dotenv = require('dotenv');
dotenv.config();

const creditsConfig = {
  SIGNUP_BONUS: parseInt(process.env.CREDITS_SIGNUP_BONUS, 10) || 3,
  PROVIDER_MODE: process.env.PAYMENT_PROVIDER_MODE || 'mock',
};

module.exports = creditsConfig;
