const Order = require('../models/order.model');
const cartClient = require('./cart.client');
const productCatalogClient = require('./productCatalog.client');
const paymentClient = require('./payment.client');
const logger = require('../config/logger');

const rollbackStock = async (decremented) => {
  await Promise.all(decremented.map(({ productId, quantity }) => productCatalogClient.incrementStock(productId, quantity)));
};

const checkout = async (userId, bearerToken, shippingAddress, customerEmail) => {
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

  let payment = null;

  try {
    payment = await paymentClient.charge({
      orderId: order._id.toString(),
      userId,
      amount: total,
      currency,
      customer: {
        name: shippingAddress.fullName,
        email: customerEmail,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
      },
    });
  } catch (error) {
    logger.error({ err: error, orderId: order._id }, 'Payment request errored - outcome unknown, check the payment provider');
  }

  // Redirect gateway: the customer pays on the gateway's page. Stock stays reserved and the cart is kept until
  // payment-service reports the result through applyPaymentResult.
  if (payment?.redirectUrl) {
    order.paymentId = payment._id;
    order.awaitingPayment = true;
    await order.save();

    logger.info({ orderId: order._id, userId }, 'Order created, waiting for payment on the gateway');

    return { order, paymentUrl: payment.redirectUrl };
  }

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

// Called by payment-service once a redirect payment ends. Idempotent: only an order that is still pending changes.
const applyPaymentResult = async (orderId, { paymentId, status }) => {
  const order = await Order.findById(orderId);

  if (!order) {
    return { error: 'not_found' };
  }

  if (order.status !== 'pending_payment') {
    if (status === 'succeeded' && order.status !== 'paid') {
      logger.error({ orderId, paymentId, orderStatus: order.status }, 'Payment succeeded for an order that is no longer pending - refund or reconcile manually');
    }

    return { order };
  }

  const nextStatus = { succeeded: 'paid', cancelled: 'cancelled' }[status] || 'payment_failed';

  // Atomic, so a callback and an IPN arriving together cannot both apply their side effects.
  const updated = await Order.findOneAndUpdate(
    { _id: orderId, status: 'pending_payment' },
    { $set: { status: nextStatus, paymentId, awaitingPayment: false } },
    { returnDocument: 'after' },
  );

  if (!updated) {
    return { order: await Order.findById(orderId) };
  }

  if (nextStatus === 'paid') {
    await cartClient.clearCartForUser(updated.userId);
    logger.info({ orderId, userId: updated.userId }, 'Order paid');
  } else {
    await rollbackStock(updated.items.map(({ productId, quantity }) => ({ productId, quantity })));
    logger.warn({ orderId, status: nextStatus }, 'Payment did not complete, stock released');
  }

  return { order: updated };
};

// Cancels orders whose customer never came back from the gateway, releasing the reserved stock.
const expireStaleOrders = async (maxAgeMinutes = 30) => {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
  const stale = await Order.find({ status: 'pending_payment', awaitingPayment: true, createdAt: { $lt: cutoff } });

  for (const order of stale) {
    // eslint-disable-next-line no-await-in-loop
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: 'pending_payment' },
      { $set: { status: 'cancelled', awaitingPayment: false } },
      { returnDocument: 'after' },
    );

    if (updated) {
      // eslint-disable-next-line no-await-in-loop
      await rollbackStock(updated.items.map(({ productId, quantity }) => ({ productId, quantity })));
      logger.warn({ orderId: updated._id }, 'Expired unpaid order, stock released');
    }
  }

  return stale.length;
};

const listOrders = async (userId) => Order.find({ userId }).sort({ createdAt: -1 });

const listAllOrders = async ({ status, shopId } = {}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (shopId) {
    filter['items.shopId'] = shopId;
  }

  return Order.find(filter).sort({ createdAt: -1 });
};

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

const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_DAYS = 14;

const dayKey = (date) => date.toISOString().slice(0, 10);

// Sales figures for one shop: only the shop's own line items count, and only paid orders count as sales.
const getShopSummary = async (shopId) => {
  const orders = await Order.find({ 'items.shopId': shopId }).sort({ createdAt: -1 });

  const today = new Date();
  const daily = new Map();

  for (let i = CHART_DAYS - 1; i >= 0; i -= 1) {
    daily.set(dayKey(new Date(today.getTime() - i * DAY_MS)), { revenue: 0, orders: 0 });
  }

  const summary = { revenue: 0, unitsSold: 0, paidOrders: 0, pendingOrders: 0, unsuccessfulOrders: 0 };
  const customers = new Set();
  const byProduct = new Map();
  const recent = [];
  let currency = 'BDT';

  for (const order of orders) {
    const shopItems = order.items.filter((item) => item.shopId === shopId);
    const shopTotal = shopItems.reduce((sum, item) => sum + item.subtotal, 0);

    currency = order.currency || currency;

    if (recent.length < 6) {
      recent.push({ _id: order._id, status: order.status, createdAt: order.createdAt, total: shopTotal, units: shopItems.reduce((sum, item) => sum + item.quantity, 0) });
    }

    if (order.status === 'pending_payment') {
      summary.pendingOrders += 1;
    } else if (order.status !== 'paid') {
      summary.unsuccessfulOrders += 1;
    } else {
      summary.paidOrders += 1;
      summary.revenue += shopTotal;
      customers.add(order.userId);

      const bucket = daily.get(dayKey(order.createdAt));

      if (bucket) {
        bucket.revenue += shopTotal;
        bucket.orders += 1;
      }

      for (const item of shopItems) {
        summary.unitsSold += item.quantity;
        const entry = byProduct.get(item.productId) || { productId: item.productId, name: item.name, units: 0, revenue: 0 };
        entry.units += item.quantity;
        entry.revenue += item.subtotal;
        byProduct.set(item.productId, entry);
      }
    }
  }

  return {
    currency,
    ...summary,
    customers: customers.size,
    averageOrderValue: summary.paidOrders ? Math.round(summary.revenue / summary.paidOrders) : 0,
    daily: [...daily].map(([date, values]) => ({ date, ...values })),
    topProducts: [...byProduct.values()].sort((a, b) => b.units - a.units).slice(0, 5),
    recentOrders: recent,
  };
};

module.exports = { getShopSummary, checkout, applyPaymentResult, expireStaleOrders, listOrders, listAllOrders, getOrder };
