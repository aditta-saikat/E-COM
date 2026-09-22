const orderService = require('../services/order.service');

const ERROR_RESPONSES = {
  empty_cart: [400, 'Your cart is empty'],
  items_unavailable: [409, 'Some items in your cart are no longer available'],
  insufficient_stock: [409, 'One or more items went out of stock during checkout'],
  payment_failed: [402, 'Payment was declined'],
};

const createOrder = async (req, res, next) => {
  try {
    const shippingAddress = {
      fullName: req.body.shippingAddress?.fullName || '',
      phone: req.body.shippingAddress?.phone || '',
      address: req.body.shippingAddress?.address || '',
    };

    const result = await orderService.checkout(req.user.uid, req.bearerToken, shippingAddress);

    if (result.error) {
      const [status, message] = ERROR_RESPONSES[result.error] || [500, 'Could not place order'];
      return res.status(status).json({ error: message, details: result.details, order: result.order });
    }

    return res.status(201).json(result.order);
  } catch (error) {
    return next(error);
  }
};

const listOrders = async (req, res) => {
  const orders = await orderService.listOrders(req.user.uid);
  return res.status(200).json({ items: orders });
};

const getOrder = async (req, res) => {
  const result = await orderService.getOrder(req.params.id, req.user.uid, req.user.role === 'admin');

  if (result.error === 'not_found') {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (result.error === 'forbidden') {
    return res.status(403).json({ error: 'You do not have access to this order' });
  }

  return res.status(200).json(result.order);
};

module.exports = { createOrder, listOrders, getOrder };
