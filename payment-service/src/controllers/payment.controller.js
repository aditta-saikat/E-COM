const { validationResult } = require('express-validator');
const paymentService = require('../services/payment.service');

const charge = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { orderId, userId, amount, currency } = req.body;
    const payment = await paymentService.charge({ orderId, userId, amount, currency });

    return res.status(payment.status === 'succeeded' ? 201 : 402).json(payment);
  } catch (error) {
    return next(error);
  }
};

const getPayment = async (req, res) => {
  const payment = await paymentService.getById(req.params.id);

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  return res.status(200).json(payment);
};

const getPaymentByOrder = async (req, res) => {
  const payment = await paymentService.getByOrderId(req.query.orderId);

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  return res.status(200).json(payment);
};

module.exports = { charge, getPayment, getPaymentByOrder };
