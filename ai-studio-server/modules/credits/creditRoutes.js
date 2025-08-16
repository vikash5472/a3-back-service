

const express = require('express');
const router = express.Router();
const paymentRouter = express.Router();
const { createValidator } = require('express-joi-validation');
const validator = createValidator();

const {
  paginationSchema,
  createIntentSchema,
} = require('../../utils/validators');

const {
  getCreditPlans,
  getCreditBalance,
  getCreditTransactions,
  createPaymentIntent,
  confirmMockPayment,
  razorpayWebhook,
  getRazorpayTransactions,
} = require('./creditsController');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/plans', protect, getCreditPlans);
router.get('/balance', protect, getCreditBalance);
router.get('/transactions', protect, validator.query(paginationSchema), getCreditTransactions);
router.post('/intent', protect, validator.body(createIntentSchema), createPaymentIntent);
router.post('/mock/confirm', protect, confirmMockPayment);

paymentRouter.get('/razorpay/transactions', protect, validator.query(paginationSchema), getRazorpayTransactions);

module.exports = {
    creditRoutes: router,
    paymentRoutes: paymentRouter,
    razorpayWebhook,
};

