
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const PaymentIntent = require('../modules/database/models/PaymentIntent');
const { confirmRazorpayPayment } = require('../modules/credits/creditsService');
const { razorpayClient } = require('../modules/razorpay/razorpayService');

const reconcilePayments = async () => {
  await connectDB();

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const pendingIntents = await PaymentIntent.find({
    status: 'CREATED',
    provider: 'razorpay',
    createdAt: { $lt: twentyFourHoursAgo },
  });

  for (const intent of pendingIntents) {
    try {
      const order = await razorpayClient.orders.fetch(intent.providerOrderId);

      if (order.status === 'paid') {
        const payments = await razorpayClient.orders.fetchPayments(intent.providerOrderId);
        const capturedPayment = payments.items.find(p => p.status === 'captured');

        if (capturedPayment) {
          await confirmRazorpayPayment(capturedPayment);
          console.log(`Reconciled and credited payment for order_id: ${intent.providerOrderId}`);
        }
      } else if (order.status === 'created' && new Date(order.created_at * 1000) < twentyFourHoursAgo) {
        intent.status = 'FAILED';
        await intent.save();
        console.log(`Marked intent as FAILED for order_id: ${intent.providerOrderId}`);
      }
    } catch (error) {
      console.error(`Error reconciling payment for order_id: ${intent.providerOrderId}`, error);
    }
  }

  mongoose.connection.close();
};

reconcilePayments();
