const logger = require('../config/logger');

const getCart = async (bearerToken) => {
  const response = await fetch(`${process.env.CART_SERVICE_URL}/api/cart`, {
    headers: { Authorization: bearerToken },
  });

  if (!response.ok) {
    logger.error({ status: response.status }, 'cart-service getCart failed');
    throw new Error(`cart-service getCart failed with status ${response.status}`);
  }

  return response.json();
};

const clearCart = async (bearerToken) => {
  const response = await fetch(`${process.env.CART_SERVICE_URL}/api/cart`, {
    method: 'DELETE',
    headers: { Authorization: bearerToken },
  });

  if (!response.ok && response.status !== 204) {
    logger.error({ status: response.status }, 'cart-service clearCart failed');
  }
};

module.exports = { getCart, clearCart };
