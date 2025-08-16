
const mongoose = require('mongoose');
const User = require('../database/models/User');
const CreditTransaction = require('../database/models/CreditTransaction');
const PaymentIntent = require('../database/models/PaymentIntent');
const { SIGNUP_BONUS } = require('../../config/creditsConfig');

const grantSignupBonus = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId).session(session);

    if (user && !user.signupCreditGranted && SIGNUP_BONUS > 0) {
      user.credits += SIGNUP_BONUS;
      user.signupCreditGranted = true;
      await user.save({ session });

      const creditTransaction = new CreditTransaction({
        userId: user._id,
        type: 'SIGNUP_BONUS',
        amount: SIGNUP_BONUS,
        balanceAfter: user.credits,
        status: 'SUCCESS',
      });
      await creditTransaction.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const debitCredits = async (userId, amountToDebit) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId).session(session);

    if (!user || user.credits < amountToDebit) {
      throw new Error('INSUFFICIENT_CREDITS');
    }

    user.credits -= amountToDebit;
    await user.save({ session });

    const creditTransaction = new CreditTransaction({
      userId: user._id,
      type: 'DEBIT',
      amount: -amountToDebit,
      balanceAfter: user.credits,
      status: 'SUCCESS',
    });
    await creditTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { newBalance: user.credits };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const confirmRazorpayPayment = async (paymentData) => {
  const { order_id, payment_id, amount, currency } = paymentData;

  const intent = await PaymentIntent.findOne({ providerOrderId: order_id });

  if (!intent) {
    // This can happen if the webhook arrives before the intent is saved.
    // We can log this and handle it with a reconciliation job.
    console.error(`PaymentIntent not found for order_id: ${order_id}`);
    return;
  }

  if (intent.status === 'PAID') {
    return;
  }

  if (intent.planSnapshot.priceMinor !== amount || intent.planSnapshot.priceCurrency !== currency) {
    console.error(`Payment amount or currency mismatch for order_id: ${order_id}`);
    intent.status = 'FAILED';
    await intent.save();
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    intent.status = 'PAID';
    intent.providerPaymentIds.push(payment_id);
    await intent.save({ session });

    const user = await User.findById(intent.userId).session(session);
    user.credits += intent.planSnapshot.credits;
    await user.save({ session });

    const creditTransaction = new CreditTransaction({
      userId: intent.userId,
      type: 'PURCHASE',
      amount: intent.planSnapshot.credits,
      balanceAfter: user.credits,
      status: 'SUCCESS',
      meta: {
        planId: intent.planId,
        planCode: intent.planSnapshot.code,
        provider: 'razorpay',
        providerOrderId: order_id,
        providerPaymentId: payment_id,
        intentId: intent._id,
        priceCurrency: intent.planSnapshot.priceCurrency,
        priceMinor: intent.planSnapshot.priceMinor,
        displayName: intent.planSnapshot.displayName,
      },
    });
    await creditTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      console.error(`Duplicate payment processed for payment_id: ${payment_id}`);
    } else {
      throw error;
    }
  }
};

module.exports = {
  grantSignupBonus,
  debitCredits,
  confirmRazorpayPayment,
};
