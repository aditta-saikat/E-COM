const Payment = require('../models/payment.model');
const mockProvider = require('../providers/mock.provider');
const logger = require('../config/logger');

const providers = { mock: mockProvider };

const charge = async ({ orderId, userId, amount, currency }) => {
  const provider = providers[process.env.PAYMENT_PROVIDER || 'mock'];
  const result = await provider.charge({ amount, currency });

  const payment = await Payment.create({
    orderId,
    userId,
    amount,
    currency,
    status: result.status,
    provider: process.env.PAYMENT_PROVIDER || 'mock',
    providerReference: result.providerReference,
    failureReason: result.failureReason,
  });

  logger.info({ paymentId: payment._id, orderId, status: result.status }, 'Payment processed');

  return payment;
};

const getById = async (id) => Payment.findById(id);

const getByOrderId = async (orderId) => Payment.findOne({ orderId });

module.exports = { charge, getById, getByOrderId };
