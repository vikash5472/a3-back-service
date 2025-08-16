
const mongoose = require('mongoose');
const User = require('../database/models/User');
const CreditTransaction = require('./models/CreditTransaction');
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

module.exports = {
  grantSignupBonus,
  debitCredits,
};
