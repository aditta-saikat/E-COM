const { createProxyMiddleware } = require('http-proxy-middleware');
const { SERVICES } = require('./config/routes');

const PROXY_TIMEOUT_MS = 20000;

// One reverse proxy per service. No body parser runs before these: the request body is streamed straight through
// untouched, which is also why form posts from SSLCommerz work.
const buildProxies = () =>
  SERVICES.map((service) =>
    createProxyMiddleware({
      target: service.target(),
      changeOrigin: true,
      xfwd: true,
      proxyTimeout: PROXY_TIMEOUT_MS,
      timeout: PROXY_TIMEOUT_MS,
      pathFilter: (path) => service.prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)),
      on: {
        proxyReq: (proxyReq, req) => {
          proxyReq.setHeader('X-Request-Id', req.id);
        },
        error: (error, req, res) => {
          req.log?.error({ err: error, service: service.name }, 'Upstream service unavailable');

          if (res.headersSent || typeof res.status !== 'function') {
            res.end?.();
            return;
          }

          const timedOut = error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT';
          res.status(timedOut ? 504 : 502).json({ error: `The ${service.name} service is ${timedOut ? 'not responding' : 'unavailable'}` });
        },
      },
    }),
  );

module.exports = buildProxies;
