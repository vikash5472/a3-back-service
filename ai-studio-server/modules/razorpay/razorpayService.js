
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = require('../../config/creditsConfig');

let razorpayClient;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpayClient = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

const createOrder = async (amount, receipt, notes) => {
  if (!razorpayClient) {
    throw new Error('Razorpay client not initialized');
  }

  const options = {
    amount, // amount in the smallest currency unit
    currency: 'INR',
    receipt,
    notes,
    payment_capture: 1,
  };

  try {
    const order = await razorpayClient.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create Razorpay order');
  }
};

const verifyWebhookSignature = (body, signature) => {
  const hmac = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET);
  hmac.update(body);
  const generatedSignature = hmac.digest('hex');

  return generatedSignature === signature;
};

module.exports = {
  razorpayClient,
  createOrder,
  verifyWebhookSignature,
};
