// The gateway's route table. Two jobs:
//   1. SERVICES: which service owns which URL prefix (routing).
//   2. RULES: who may call what (access control). First matching rule wins; anything under a service prefix that
//      no rule matches requires a valid token.
//
// "blocked" routes exist only for service-to-service calls (they are protected by the internal API key inside the
// services). The gateway answers 404 for them, so the public internet never even reaches those endpoints.

const OBJECT_ID = '[a-f0-9]{24}';

const SERVICES = [
  { name: 'auth', prefixes: ['/api/auth', '/api/users'], target: () => process.env.AUTH_SERVICE_URL || 'http://localhost:3001' },
  { name: 'catalog', prefixes: ['/api/products', '/api/shops'], target: () => process.env.PRODUCT_CATALOG_URL || 'http://localhost:3002' },
  { name: 'cart', prefixes: ['/api/cart'], target: () => process.env.CART_SERVICE_URL || 'http://localhost:3003' },
  { name: 'order', prefixes: ['/api/orders'], target: () => process.env.ORDER_SERVICE_URL || 'http://localhost:3004' },
  { name: 'payment', prefixes: ['/api/payments'], target: () => process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005' },
];

const RULES = [
  // Internal only
  { access: 'blocked', path: /^\/api\/products\/verify$/ },
  { access: 'blocked', path: /^\/api\/products\/[^/]+\/stock\/(increment|decrement)$/ },
  { access: 'blocked', path: /^\/api\/orders\/[^/]+\/payment-result$/ },
  { access: 'blocked', path: /^\/api\/cart\/internal(\/|$)/ },

  // SSLCommerz calls these from its servers and the customer's browser; payment-service verifies them itself.
  { access: 'public', path: /^\/api\/payments\/sslcommerz\/(success|fail|cancel|ipn)$/ },
  { access: 'blocked', path: /^\/api\/payments(\/|$)/ },

  // Public: no token needed
  { access: 'public', method: 'POST', path: /^\/api\/auth\/(signup|login)$/ },
  { access: 'public', method: 'GET', path: /^\/api\/products(\/categories)?$/ },
  { access: 'public', method: 'GET', path: new RegExp(`^/api/products/${OBJECT_ID}$`) },
  { access: 'public', method: 'GET', path: /^\/api\/shops$/ },
  { access: 'public', method: 'GET', path: new RegExp(`^/api/shops/${OBJECT_ID}$`) },
];

const findService = (path) => SERVICES.find((service) => service.prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)));

const accessFor = (method, path) => {
  const rule = RULES.find((item) => (!item.method || item.method === method) && item.path.test(path));
  return rule ? rule.access : 'authenticated';
};

module.exports = { SERVICES, RULES, findService, accessFor };
