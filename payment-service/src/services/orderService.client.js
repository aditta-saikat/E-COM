const logger = require('../config/logger');

// Tells order-service how a redirect payment ended so it can mark the order paid, or release the stock.
const reportPaymentResult = async ({ orderId, paymentId, status }) => {
  const response = await fetch(`${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}/payment-result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Api-Key': process.env.INTERNAL_API_KEY,
    },
    body: JSON.stringify({ paymentId, status }),
  });

  if (!response.ok) {
    logger.error({ orderId, paymentId, status, httpStatus: response.status }, 'order-service did not accept the payment result - reconcile this order manually');
    throw new Error(`order-service payment-result failed with status ${response.status}`);
  }
};

module.exports = { reportPaymentResult };
