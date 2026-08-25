const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

const app = require('../src/app');

const request = (server, path) => new Promise((resolve, reject) => {
  const { port } = server.address();
  const requestOptions = { hostname: '127.0.0.1', port, path, method: 'GET' };
  const request = http.request(requestOptions, (response) => {
    let body = '';
    response.on('data', (chunk) => { body += chunk; });
    response.on('end', () => resolve({ statusCode: response.statusCode, body: JSON.parse(body) }));
  });
  request.on('error', reject);
  request.end();
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