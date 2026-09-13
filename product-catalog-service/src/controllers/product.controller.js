const { validationResult } = require('express-validator');
const productService = require('../services/product.service');
const shopService = require('../services/shop.service');

const getProducts = async (req, res) => {
  const { category, search, page, shopId } = req.query;
  const result = await productService.listProducts({ category, search, page, shopId });

  return res.status(200).json(result);
};

const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  if (!product || !product.isActive) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.status(200).json(product);
};

const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const isAdmin = req.user.role === 'admin';
  let { shopId } = req.body;

  if (!isAdmin) {
    const shop = await shopService.getShopByOwner(req.user.uid);

    if (!shop || shop.status !== 'approved') {
      return res.status(403).json({ error: 'You need an approved shop to create products' });
    }

    shopId = shop._id;
  } else if (!shopId) {
    return res.status(400).json({ error: 'shopId is required' });
  }

  const product = await productService.createProduct(req.body, req.user.uid, shopId);

  return res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const result = await productService.updateProduct(
    req.params.id,
    req.body,
    req.user.uid,
    req.user.role === 'admin',
  );

  if (result.error === 'not_found') {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (result.error === 'forbidden') {
    return res.status(403).json({ error: 'You do not own this product' });
  }

  return res.status(200).json(result.product);
};

const deleteProduct = async (req, res) => {
  const result = await productService.deleteProduct(
    req.params.id,
    req.user.uid,
    req.user.role === 'admin',
  );

  if (result.error === 'not_found') {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (result.error === 'forbidden') {
    return res.status(403).json({ error: 'You do not own this product' });
  }

  return res.status(204).send();
};

const verifyProducts = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }

  const result = await productService.verifyProducts(items);

  return res.status(200).json(result);
};

const decrementStock = async (req, res) => {
  const { quantity } = req.body;
  const result = await productService.decrementStock(req.params.id, quantity);

  if (result.error) {
    return res.status(409).json({ error: 'Insufficient stock or product not found' });
  }

  return res.status(200).json(result.product);
};

const incrementStock = async (req, res) => {
  const { quantity } = req.body;
  const result = await productService.incrementStock(req.params.id, quantity);

  if (result.error) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.status(200).json(result.product);
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  verifyProducts,
  decrementStock,
  incrementStock,
};
