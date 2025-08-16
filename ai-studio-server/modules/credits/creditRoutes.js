

const express = require('express');
const router = express.Router();
const {
  getCreditPlans,
  getCreditBalance,
  getCreditTransactions,
  createPaymentIntent,
  confirmMockPayment,
  razorpayWebhook,
} = require('./creditsController');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/plans', getCreditPlans);
router.get('/balance', protect, getCreditBalance);
router.get('/transactions', protect, getCreditTransactions);
router.post('/intent', protect, createPaymentIntent);
router.post('/mock/confirm', protect, confirmMockPayment);

module.exports = {
    creditRoutes: router,
    razorpayWebhook,
};

