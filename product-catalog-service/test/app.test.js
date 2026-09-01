const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

const app = require('../src/app');

const request = (server, path, options = {}) => new Promise((resolve, reject) => {
  const { port } = server.address();
  const requestOptions = { hostname: '127.0.0.1', port, path, method: options.method || 'GET' };
  const req = http.request(requestOptions, (response) => {
    let body = '';
    response.on('data', (chunk) => { body += chunk; });
    response.on('end', () => resolve({ statusCode: response.statusCode, body: JSON.parse(body) }));
  });
  req.on('error', reject);
  req.end(options.body ? JSON.stringify(options.body) : undefined);
});

test('health endpoint reports the service is available', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  const response = await request(server, '/health');

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { status: 'ok', service: 'product-catalog-service' });
});

test('creating a product rejects requests without a Bearer token', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/products', {
    method: 'POST',
    body: { name: 'Test product', price: 10, sku: 'TEST-1' },
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, 'A Bearer token is required');
});

test('internal stock endpoints reject requests without a valid internal API key', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/products/000000000000000000000000/stock/decrement', {
    method: 'POST',
    body: { quantity: 1 },
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, 'A valid internal API key is required');
});
