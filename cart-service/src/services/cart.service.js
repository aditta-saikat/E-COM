const Cart = require('../models/cart.model');
const productCatalogClient = require('../services/productCatalog.client');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
};

const hydrateItems = async (rawItems) => {
  const hydratedItems = await Promise.all(
    rawItems.map(async (item) => {
      const product = await productCatalogClient.getProduct(item.productId);

      if (!product || !product.isActive) {
        return null;
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        name: product.name,
        price: product.price,
        currency: product.currency,
        image: product.images?.[0] || null,
        shopId: product.shopId,
        stock: product.stock,
      };
    }),
  );

  return hydratedItems.filter(Boolean);
};

const getHydratedCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  const items = await hydrateItems(cart.items);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { items, subtotal };
};

const listAllCarts = async ({ shopId } = {}) => {
  const carts = await Cart.find({ 'items.0': { $exists: true } }).sort({ updatedAt: -1 });

  const hydrated = await Promise.all(
    carts.map(async (cart) => {
      const items = await hydrateItems(cart.items);
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { userId: cart.userId, items, subtotal, updatedAt: cart.updatedAt };
    }),
  );

  const withItems = hydrated.filter((cart) => cart.items.length > 0);

  if (!shopId) {
    return withItems;
  }

  return withItems
    .map((cart) => ({
      ...cart,
      items: cart.items.filter((item) => item.shopId === shopId),
    }))
    .filter((cart) => cart.items.length > 0)
    .map((cart) => ({
      ...cart,
      subtotal: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }));
};

const addItem = async (userId, productId, quantity) => {
  const product = await productCatalogClient.getProduct(productId);

  if (!product || !product.isActive) {
    return { error: 'not_found' };
  }

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();

  return { cart };
};

const updateItemQuantity = async (userId, productId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((item) => item.productId === productId);

  if (!existing) {
    return { error: 'not_found' };
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.productId !== productId);
  } else {
    existing.quantity = quantity;
  }

  await cart.save();

  return { cart };
};

const removeItem = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((item) => item.productId !== productId);
  await cart.save();

  return { cart };
};

const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();

  return { cart };
};

module.exports = {
  getOrCreateCart,
  getHydratedCart,
  listAllCarts,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
};
