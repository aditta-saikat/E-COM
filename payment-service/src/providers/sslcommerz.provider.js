// SSLCommerz is a redirect gateway: createSession() returns a hosted-page URL, the customer pays there, and
// SSLCommerz sends the browser back to our callbacks. validate() must confirm every success with SSLCommerz.
const logger = require('../config/logger');

const SANDBOX_BASE = 'https://sandbox.sslcommerz.com';
const LIVE_BASE = 'https://securepay.sslcommerz.com';

const baseUrl = () => (process.env.SSLCOMMERZ_IS_LIVE === 'true' ? LIVE_BASE : SANDBOX_BASE);

const credentials = () => {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;

  if (!storeId || !storePassword) {
    throw new Error('SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD are not configured');
  }

  return { storeId, storePassword };
};

const callbackUrl = (path) => `${process.env.PUBLIC_PAYMENT_URL || 'http://localhost:3005'}/api/payments/sslcommerz/${path}`;

const mask = (value) => {
  const text = String(value || '');
  return text.length <= 2 ? '*'.repeat(text.length) : `${text.slice(0, 2)}${'*'.repeat(Math.min(text.length - 2, 8))} (${text.length} chars)`;
};

// Logs which customer fields went to SSLCommerz, and which fell back to a placeholder, without printing personal data.
const logCustomerFields = (customer, body) => {
  const sent = {};

  for (const [field, source] of [['cus_name', 'name'], ['cus_email', 'email'], ['cus_phone', 'phone'], ['cus_add1', 'address']]) {
    sent[field] = customer[source] ? mask(body.get(field)) : `placeholder (${body.get(field)})`;
  }

  return sent;
};

const createSession = async ({ paymentId, orderId, amount, currency, customer = {} }) => {
  const { storeId, storePassword } = credentials();

  const body = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: (amount / 100).toFixed(2),
    currency,
    tran_id: paymentId,
    success_url: callbackUrl('success'),
    fail_url: callbackUrl('fail'),
    cancel_url: callbackUrl('cancel'),
    ipn_url: callbackUrl('ipn'),
    shipping_method: 'NO',
    product_name: `E-COM order ${orderId}`,
    product_category: 'general',
    product_profile: 'general',
    cus_name: customer.name || 'Customer',
    cus_email: customer.email || 'customer@example.com',
    cus_add1: customer.address || 'N/A',
    cus_city: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: customer.phone || '01700000000',
    value_a: orderId,
  });

  logger.info({ tranId: paymentId, customerFields: logCustomerFields(customer, body) }, 'Sending customer details to SSLCommerz');

  const response = await fetch(`${baseUrl()}/gwprocess/v4/api.php`, { method: 'POST', body });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status !== 'SUCCESS' || !result.GatewayPageURL) {
    throw new Error(result?.failedreason || `SSLCommerz session request failed (${response.status})`);
  }

  return { redirectUrl: result.GatewayPageURL, providerReference: paymentId };
};

// Asks SSLCommerz whether a val_id from a callback is a genuine, completed payment.
const validate = async (valId) => {
  const { storeId, storePassword } = credentials();
  const query = new URLSearchParams({ val_id: valId, store_id: storeId, store_passwd: storePassword, format: 'json' });

  const response = await fetch(`${baseUrl()}/validator/api/validationserverAPI.php?${query}`);
  const result = await response.json().catch(() => null);

  if (!response.ok || !result) {
    throw new Error(`SSLCommerz validation request failed (${response.status})`);
  }

  return result;
};

module.exports = { createSession, validate };
