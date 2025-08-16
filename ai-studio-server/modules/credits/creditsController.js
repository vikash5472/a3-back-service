
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const CreditPlan = require('../database/models/CreditPlan');
const PaymentIntent = require('../database/models/PaymentIntent');
const CreditTransaction = require('../database/models/CreditTransaction');
const User = require('../database/models/User');
const { PROVIDER_MODE, RAZORPAY_KEY_ID } = require('../../config/creditsConfig');
const { createOrder, verifyWebhookSignature } = require('../razorpay/razorpayService');
const { confirmRazorpayPayment } = require('./creditsService');

// @desc    Get active credit plans
// @route   GET /api/credits/plans
// @access  Public
const getCreditPlans = asyncHandler(async (req, res) => {
  const plans = await CreditPlan.find({ isActive: true }).sort({ sort: 1, createdAt: 1 });
  res.json(plans);
});

// @desc    Get user's credit balance
// @route   GET /api/credits/balance
// @access  Private
const getCreditBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ balance: user.credits });
});

// @desc    Get user's credit transactions
// @route   GET /api/credits/transactions
// @access  Private
const getCreditTransactions = asyncHandler(async (req, res) => {
  const { limit = 10, cursor } = req.query;
  const query = { userId: req.user.id };

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const transactions = await CreditTransaction.find(query)
    .sort({ _id: -1 })
    .limit(parseInt(limit, 10));

  const nextCursor = transactions.length === parseInt(limit, 10) ? transactions[transactions.length - 1]._id : null;

  res.json({ transactions, nextCursor });
});

// @desc    Create a payment intent
// @route   POST /api/credits/intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { planId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(planId)) {
    res.status(400);
    throw new Error('INVALID_PLAN');
  }

  const plan = await CreditPlan.findOne({ _id: planId, isActive: true });
  if (!plan) {
    res.status(400);
    throw new Error('INVALID_PLAN');
  }

  if (PROVIDER_MODE === 'razorpay') {
    if (plan.priceCurrency !== 'INR') {
      res.status(400);
      throw new Error('UNSUPPORTED_CURRENCY');
    }

    const intent = await PaymentIntent.create({
      userId: req.user.id,
      planId: plan._id,
      planSnapshot: {
        code: plan.code,
        displayName: plan.displayName,
        priceCurrency: plan.priceCurrency,
        priceMinor: plan.priceMinor,
        credits: plan.credits,
      },
      provider: 'razorpay',
      status: 'CREATED',
      idempotencyKey: uuidv4(), // for client-side deduplication
    });

    const order = await createOrder(plan.priceMinor, intent._id.toString(), {
      userId: req.user.id,
      planId: plan._id.toString(),
      planCode: plan.code,
    });

    intent.providerOrderId = order.id;
    await intent.save();

    res.status(201).json({
      intentId: intent._id,
      provider: 'razorpay',
      orderId: order.id,
      keyId: RAZORPAY_KEY_ID,
      amount: { currency: plan.priceCurrency, minor: plan.priceMinor },
      credits: plan.credits,
      plan: { id: plan._id, code: plan.code, name: plan.displayName },
    });
  } else {
    const idempotencyKey = uuidv4();
    const providerOrderId = `mock_${new Date().getTime()}`;

    const paymentIntent = await PaymentIntent.create({
      userId: req.user.id,
      planId: plan._id,
      planSnapshot: {
        code: plan.code,
        displayName: plan.displayName,
        priceCurrency: plan.priceCurrency,
        priceMinor: plan.priceMinor,
        credits: plan.credits,
      },
      provider: 'mock',
      providerOrderId,
      status: 'CREATED',
      idempotencyKey,
    });

    res.status(201).json({
      intentId: paymentIntent._id,
      provider: 'mock',
      providerOrderId,
      idempotencyKey,
      amount: { currency: plan.priceCurrency, minor: plan.priceMinor },
      credits: plan.credits,
      plan: { id: plan._id, code: plan.code, name: plan.displayName },
    });
  }
});

// @desc    Confirm a mock payment
// @route   POST /api/credits/mock/confirm
// @access  Private
const confirmMockPayment = asyncHandler(async (req, res) => {
  const { intentId, idempotencyKey } = req.body;

  if (!mongoose.Types.ObjectId.isValid(intentId) || !idempotencyKey) {
    res.status(400);
    throw new Error('INVALID_REQUEST');
  }

  const intent = await PaymentIntent.findById(intentId);

  if (!intent) {
    res.status(404);
    throw new Error('INTENT_NOT_FOUND');
  }

  if (intent.idempotencyKey !== idempotencyKey) {
    res.status(409);
    throw new Error('IDEMPOTENCY_CONFLICT');
  }

  if (intent.status === 'PAID') {
    const user = await User.findById(req.user.id);
    return res.json({ ok: true, newBalance: user.credits, alreadyProcessed: true });
  }

  if (intent.status !== 'CREATED') {
    res.status(400);
    throw new Error('INVALID_STATE');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    intent.status = 'PAID';
    await intent.save({ session });

    const user = await User.findById(req.user.id).session(session);
    user.credits += intent.planSnapshot.credits;
    await user.save({ session });

    const creditTransaction = new CreditTransaction({
      userId: req.user.id,
      type: 'PURCHASE',
      amount: intent.planSnapshot.credits,
      balanceAfter: user.credits,
      status: 'SUCCESS',
      meta: {
        planId: intent.planId,
        planCode: intent.planSnapshot.code,
        provider: intent.provider,
        providerOrderId: intent.providerOrderId,
        intentId: intent._id,
        idempotencyKey: intent.idempotencyKey,
        priceCurrency: intent.planSnapshot.priceCurrency,
        priceMinor: intent.planSnapshot.priceMinor,
        displayName: intent.planSnapshot.displayName,
      },
    });
    await creditTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ ok: true, newBalance: user.credits });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// @desc    Handle Razorpay webhooks
// @route   POST /api/credits/razorpay/webhook
// @access  Public
const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const isValid = verifyWebhookSignature(req.rawBody, signature);

  if (!isValid) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  if (event.event === 'payment.captured') {
    await confirmRazorpayPayment(event.payload.payment.entity);
  } else if (event.event === 'payment.failed') {
    const { order_id } = event.payload.payment.entity;
    const intent = await PaymentIntent.findOne({ providerOrderId: order_id });
    if (intent && intent.status !== 'PAID') {
      intent.status = 'FAILED';
      await intent.save();
    }
  }

  res.status(200).send('OK');
});

// @desc    Get user's Razorpay payment intents
// @route   GET /api/payments/razorpay/transactions
// @access  Private
const getRazorpayTransactions = asyncHandler(async (req, res) => {
  const { limit = 10, cursor } = req.query;
  const query = { userId: req.user.id, provider: 'razorpay' };

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const paymentIntents = await PaymentIntent.find(query)
    .sort({ _id: -1 })
    .limit(parseInt(limit, 10));

  const nextCursor = paymentIntents.length === parseInt(limit, 10) ? paymentIntents[paymentIntents.length - 1]._id : null;

  res.json({ paymentIntents, nextCursor });
});

module.exports = {
  getCreditPlans,
  getCreditBalance,
  getCreditTransactions,
  createPaymentIntent,
  confirmMockPayment,
  razorpayWebhook,
  getRazorpayTransactions,
};
