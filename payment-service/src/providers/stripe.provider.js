const Stripe = require('stripe');

let client;

const getClient = () => {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  // Charges here use Stripe's test payment methods, so only test-mode keys are accepted.
  if (!/^(sk|rk)_test_/.test(key)) {
    throw new Error('The stripe provider only accepts test-mode keys (sk_test_...)');
  }

  client ||= new Stripe(key);

  return client;
};

const charge = async ({ orderId, amount, currency }) => {
  const stripe = getClient();

  try {
    const intent = await stripe.paymentIntents.create(
      {
        amount,
        currency: currency.toLowerCase(),
        payment_method: process.env.STRIPE_TEST_PAYMENT_METHOD || 'pm_card_visa',
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        description: `E-COM order ${orderId}`,
        metadata: { orderId },
      },
      { idempotencyKey: `order-${orderId}` },
    );

    if (intent.status === 'succeeded') {
      return { status: 'succeeded', providerReference: intent.id, failureReason: '' };
    }

    return { status: 'failed', providerReference: intent.id, failureReason: `Payment ${intent.status}` };
  } catch (error) {
    if (error.type === 'StripeCardError') {
      return { status: 'failed', providerReference: error.payment_intent?.id || '', failureReason: error.message };
    }

    throw error;
  }
};

module.exports = { charge };
