const logger = require('../config/logger');

const charge = async ({ orderId, userId, amount, currency }) => {
  const response = await fetch(`${process.env.PAYMENT_SERVICE_URL}/api/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Api-Key': process.env.INTERNAL_API_KEY,
    },
    body: JSON.stringify({ orderId, userId, amount, currency }),
  });

  const payment = await response.json().catch(() => null);

  if (!response.ok && response.status !== 402) {
    logger.error({ orderId, status: response.status }, 'payment-service charge request failed');
    throw new Error(`payment-service charge failed with status ${response.status}`);
  }

  return payment;
};

module.exports = { charge };
