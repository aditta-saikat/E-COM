const logger = require('../config/logger');

const getProduct = async (productId) => {
  const response = await fetch(`${process.env.PRODUCT_CATALOG_URL}/api/products/${productId}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    logger.error({ productId, status: response.status }, 'product-catalog-service lookup failed');
    throw new Error(`product-catalog-service lookup failed with status ${response.status}`);
  }

  return response.json();
};

module.exports = { getProduct };
