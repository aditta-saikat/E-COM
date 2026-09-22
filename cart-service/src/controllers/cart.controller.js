const { validationResult } = require('express-validator');
const cartService = require('../services/cart.service');

const getCart = async (req, res) => {
  const result = await cartService.getHydratedCart(req.user.uid);
  return res.status(200).json(result);
};

const listAllCarts = async (req, res) => {
  const { shopId } = req.query;
  const carts = await cartService.listAllCarts({ shopId });
  return res.status(200).json({ items: carts });
};

const addItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { productId, quantity } = req.body;
  const result = await cartService.addItem(req.user.uid, productId, quantity);

  if (result.error === 'not_found') {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.status(201).json(result.cart);
};

const updateItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const result = await cartService.updateItemQuantity(req.user.uid, req.params.productId, req.body.quantity);

  if (result.error === 'not_found') {
    return res.status(404).json({ error: 'Item not in cart' });
  }

  return res.status(200).json(result.cart);
};

const removeItem = async (req, res) => {
  const result = await cartService.removeItem(req.user.uid, req.params.productId);
  return res.status(200).json(result.cart);
};

const clearCart = async (req, res) => {
  await cartService.clearCart(req.user.uid);
  return res.status(204).send();
};

module.exports = { getCart, listAllCarts, addItem, updateItem, removeItem, clearCart };
