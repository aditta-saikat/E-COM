const Order = require('../models/order.model');
const cartClient = require('./cart.client');
const productCatalogClient = require('./productCatalog.client');
const paymentClient = require('./payment.client');
const logger = require('../config/logger');

const rollbackStock = async (decremented) => {
  await Promise.all(decremented.map(({ productId, quantity }) => productCatalogClient.incrementStock(productId, quantity)));
};

const checkout = async (userId, bearerToken, shippingAddress) => {
  const cart = await cartClient.getCart(bearerToken);

  if (!cart.items || cart.items.length === 0) {
    return { error: 'empty_cart' };
  }

  const verifyResult = await productCatalogClient.verifyItems(
    cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
  );

  if (!verifyResult.allOk) {
    return { error: 'items_unavailable', details: verifyResult.items.filter((item) => !item.ok) };
  }

  const items = cart.items.map((cartItem) => {
    const verified = verifyResult.items.find((item) => item.productId === cartItem.productId);
    const subtotal = verified.price * cartItem.quantity;

    return {
      productId: cartItem.productId,
      shopId: cartItem.shopId,
      name: cartItem.name,
      price: verified.price,
      quantity: cartItem.quantity,
      subtotal,
    };
  });

  const currency = verifyResult.items[0].currency || 'BDT';
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const order = await Order.create({
    userId,
    items,
    subtotal: total,
    total,
    currency,
    status: 'pending_payment',
    shippingAddress,
  });

  const decremented = [];

  for (const item of items) {
    const ok = await productCatalogClient.decrementStock(item.productId, item.quantity);

    if (!ok) {
      await rollbackStock(decremented);
      order.status = 'failed_stock';
      await order.save();
      logger.warn({ orderId: order._id, productId: item.productId }, 'Checkout failed: insufficient stock');
      return { error: 'insufficient_stock', order };
    }

    decremented.push({ productId: item.productId, quantity: item.quantity });
  }

  const payment = await paymentClient.charge({
    orderId: order._id.toString(),
    userId,
    amount: total,
    currency,
  });

  if (!payment || payment.status !== 'succeeded') {
    await rollbackStock(decremented);
    order.status = 'payment_failed';
    await order.save();
    logger.warn({ orderId: order._id }, 'Checkout failed: payment declined');
    return { error: 'payment_failed', order };
  }

  order.status = 'paid';
  order.paymentId = payment._id;
  await order.save();

  await cartClient.clearCart(bearerToken);

  logger.info({ orderId: order._id, userId, total }, 'Order placed successfully');

  return { order };
};

const listOrders = async (userId) => Order.find({ userId }).sort({ createdAt: -1 });

const getOrder = async (id, userId, isAdmin) => {
  const order = await Order.findById(id);

  if (!order) {
    return { error: 'not_found' };
  }

  if (order.userId !== userId && !isAdmin) {
    return { error: 'forbidden' };
  }

  return { order };
};

module.exports = { checkout, listOrders, getOrder };
