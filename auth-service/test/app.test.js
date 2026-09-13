const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

const app = require('../src/app');

const request = (server, path, options = {}) => new Promise((resolve, reject) => {
  const { port } = server.address();
  const requestOptions = {
    hostname: '127.0.0.1',
    port,
    path,
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : {},
  };
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
  assert.deepEqual(response.body, { status: 'ok', service: 'auth-service' });
});

test('protected profile endpoint rejects requests without a Bearer token', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/users/me');

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, 'A Bearer token is required');
});

test('signup rejects an invalid email and a short password', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/auth/signup', {
    method: 'POST',
    body: { email: 'not-an-email', password: '123' },
  });

  assert.equal(response.statusCode, 400);
  assert.ok(response.body.errors.length > 0);
});

test('login rejects a missing password', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/auth/login', {
    method: 'POST',
    body: { email: 'someone@example.com' },
  });

  assert.equal(response.statusCode, 400);
  assert.ok(response.body.errors.length > 0);
});

test('internal role update rejects requests without a valid internal API key', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/users/000000000000000000000000/role', {
    method: 'PATCH',
    body: { role: 'shop_admin' },
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, 'A valid internal API key is required');
});
