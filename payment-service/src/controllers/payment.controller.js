const { validationResult } = require('express-validator');
const paymentService = require('../services/payment.service');

const charge = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { orderId, userId, amount, currency, customer } = req.body;
    const { payment, redirectUrl } = await paymentService.charge({ orderId, userId, amount, currency, customer });

    if (redirectUrl) {
      return res.status(202).json({ ...payment.toObject(), redirectUrl });
    }

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

const RETURN_RESULTS = { succeeded: 'success', cancelled: 'cancelled', pending: 'pending' };

// SSLCommerz calls these from the customer's browser (success / fail / cancel) and from its servers (ipn).
const sslcommerzCallback = (outcome) => async (req, res, next) => {
  try {
    const payment = await paymentService.completeSslcommerzPayment(outcome, { ...req.query, ...req.body });

    if (outcome === 'ipn') {
      return res.status(200).json({ received: true });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!payment) {
      return res.redirect(303, `${frontendUrl}/orders`);
    }

    const result = RETURN_RESULTS[payment.status] || 'failed';

    return res.redirect(303, `${frontendUrl}/orders/${payment.orderId}?payment=${result}`);
  } catch (error) {
    return next(error);
  }
};

module.exports = { charge, getPayment, getPaymentByOrder, sslcommerzCallback };
