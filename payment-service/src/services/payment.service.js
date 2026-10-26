const mongoose = require('mongoose');
const Payment = require('../models/payment.model');
const mockProvider = require('../providers/mock.provider');
const stripeProvider = require('../providers/stripe.provider');
const sslcommerzProvider = require('../providers/sslcommerz.provider');
const orderServiceClient = require('./orderService.client');
const logger = require('../config/logger');

const providers = { mock: mockProvider, stripe: stripeProvider, sslcommerz: sslcommerzProvider };

const VALID_STATUSES = ['VALID', 'VALIDATED'];

const getProvider = () => {
  const name = process.env.PAYMENT_PROVIDER || 'mock';
  const provider = providers[name];

  if (!provider) {
    throw new Error(`Unknown PAYMENT_PROVIDER "${name}"`);
  }

  return { name, provider };
};

// Redirect providers (SSLCommerz) answer with a hosted-page URL and finish later via callbacks;
// the others (mock, Stripe) settle immediately.
const charge = async ({ orderId, userId, amount, currency, customer }) => {
  const { name, provider } = getProvider();

  if (provider.createSession) {
    const payment = await Payment.create({ orderId, userId, amount, currency, status: 'pending', provider: name });

    try {
      const session = await provider.createSession({ paymentId: payment._id.toString(), orderId, amount, currency, customer });
      payment.providerReference = session.providerReference;
      await payment.save();

      logger.info({ paymentId: payment._id, orderId }, 'Payment session created, waiting for the customer');

      return { payment, redirectUrl: session.redirectUrl };
    } catch (error) {
      logger.error({ err: error, paymentId: payment._id, orderId }, 'Could not create payment session');
      payment.status = 'failed';
      payment.failureReason = error.message;
      await payment.save();

      return { payment };
    }
  }

  const result = await provider.charge({ orderId, amount, currency });

  const payment = await Payment.create({
    orderId,
    userId,
    amount,
    currency,
    status: result.status,
    provider: name,
    providerReference: result.providerReference,
    failureReason: result.failureReason,
  });

  logger.info({ paymentId: payment._id, orderId, status: result.status }, 'Payment processed');

  return { payment };
};

const isGenuineSslcommerzPayment = (validation, payment) => {
  if (!VALID_STATUSES.includes(validation.status) || validation.tran_id !== payment._id.toString()) {
    return false;
  }

  const paidAmount = validation.currency_amount ?? validation.amount;
  const paidCurrency = validation.currency_type || validation.currency;

  if (paidAmount !== undefined && Math.round(Number(paidAmount) * 100) !== payment.amount) return false;
  if (paidCurrency && paidCurrency !== payment.currency) return false;

  return true;
};

// Handles the success / fail / cancel redirects and the IPN. Safe to call repeatedly: only a pending payment can change.
const completeSslcommerzPayment = async (outcome, payload) => {
  if (!mongoose.isValidObjectId(payload.tran_id)) return null;

  const payment = await Payment.findOne({ _id: payload.tran_id, provider: 'sslcommerz' });

  if (!payment) return null;
  if (payment.status !== 'pending') return payment;

  let status = outcome === 'cancel' || payload.status === 'CANCELLED' ? 'cancelled' : 'failed';
  let failureReason = status === 'cancelled' ? 'Cancelled by the customer' : payload.error || 'Payment failed';
  let providerTransactionId = '';

  const claimsSuccess = outcome !== 'fail' && outcome !== 'cancel' && payload.val_id && VALID_STATUSES.includes(payload.status);

  if (claimsSuccess) {
    let validation;

    try {
      validation = await sslcommerzProvider.validate(payload.val_id);
    } catch (error) {
      // Leave it pending: a later IPN can still settle it. Do not trust an unverified success.
      logger.error({ err: error, paymentId: payment._id }, 'Could not verify an SSLCommerz payment, leaving it pending');
      return payment;
    }

    if (isGenuineSslcommerzPayment(validation, payment)) {
      status = 'succeeded';
      failureReason = '';
      providerTransactionId = validation.bank_tran_id || '';
    } else {
      logger.warn({ paymentId: payment._id, validationStatus: validation.status }, 'SSLCommerz validation did not match this payment');
      failureReason = 'Payment could not be verified';
    }
  }

  const settled = await Payment.findOneAndUpdate(
    { _id: payment._id, status: 'pending' },
    { $set: { status, failureReason, providerTransactionId } },
    { returnDocument: 'after' },
  );

  // Another request (callback vs IPN) settled it first.
  if (!settled) return Payment.findById(payment._id);

  logger.info({ paymentId: settled._id, orderId: settled.orderId, status }, 'SSLCommerz payment settled');

  await orderServiceClient
    .reportPaymentResult({ orderId: settled.orderId, paymentId: settled._id.toString(), status })
    .catch(() => {});

  return settled;
};

const getById = async (id) => Payment.findById(id);

const getByOrderId = async (orderId) => Payment.findOne({ orderId });

module.exports = { charge, completeSslcommerzPayment, getById, getByOrderId };
