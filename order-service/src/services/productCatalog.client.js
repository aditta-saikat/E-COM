const logger = require('../config/logger');

const internalHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Internal-Api-Key': process.env.INTERNAL_API_KEY,
});

const verifyItems = async (items) => {
  const response = await fetch(`${process.env.PRODUCT_CATALOG_URL}/api/products/verify`, {
    method: 'POST',
    headers: internalHeaders(),
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    logger.error({ status: response.status }, 'product-catalog-service verify failed');
    throw new Error(`product-catalog-service verify failed with status ${response.status}`);
  }

  return response.json();
};

const decrementStock = async (productId, quantity) => {
  const response = await fetch(`${process.env.PRODUCT_CATALOG_URL}/api/products/${productId}/stock/decrement`, {
    method: 'POST',
    headers: internalHeaders(),
    body: JSON.stringify({ quantity }),
  });

  return response.ok;
};

const incrementStock = async (productId, quantity) => {
  const response = await fetch(`${process.env.PRODUCT_CATALOG_URL}/api/products/${productId}/stock/increment`, {
    method: 'POST',
    headers: internalHeaders(),
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    logger.error({ productId, quantity, status: response.status }, 'Stock rollback (increment) failed - manual reconciliation needed');
  }
};

// Asks the catalog for the shop owned by whoever holds this token, so the caller cannot claim someone else's shop.
const getMyShop = async (bearerToken) => {
  const response = await fetch(`${process.env.PRODUCT_CATALOG_URL}/api/shops/mine`, {
    headers: { Authorization: bearerToken },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`product-catalog-service shops/mine failed with status ${response.status}`);
  }

  return response.json();
};

module.exports = { getMyShop, verifyItems, decrementStock, incrementStock };
