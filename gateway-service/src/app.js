const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const pinoHttp = require('pino-http');

const logger = require('./config/logger');
const { SERVICES } = require('./config/routes');
const accessControl = require('./middleware/accessControl');
const { globalLimiter, authLimiter } = require('./middleware/rateLimit');
const requestId = require('./middleware/requestId');
const stripInternalHeaders = require('./middleware/stripInternalHeaders');
const buildProxies = require('./proxy');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((origin) => origin.trim());

// The gateway sits behind a platform load balancer in production; trust its X-Forwarded-For for rate limiting.
app.set('trust proxy', 1);

// Order matters: each step either passes the request on or ends it. Nothing here reads the request body.
app.use(requestId);
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.id,
    // Tokens and the internal key must never reach the logs.
    redact: { paths: ['req.headers.authorization', 'req.headers["x-internal-api-key"]', 'req.headers.cookie'], censor: '[redacted]' },
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url, remoteAddress: req.remoteAddress }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
    autoLogging: { ignore: (req) => req.url === '/health' },
  }),
);
app.use(helmet());
app.use(cors({ origin: allowedOrigins, exposedHeaders: ['X-Request-Id', 'RateLimit', 'RateLimit-Policy'] }));
app.use(stripInternalHeaders);

// Health is answered here (and checks the services behind it); it is not rate limited or proxied.
app.get('/health', async (req, res) => {
  const checks = await Promise.all(
    SERVICES.map(async (service) => {
      try {
        const response = await fetch(`${service.target()}/health`, { signal: AbortSignal.timeout(2000) });
        return [service.name, response.ok ? 'up' : 'down'];
      } catch {
        return [service.name, 'down'];
      }
    }),
  );

  const services = Object.fromEntries(checks);
  const healthy = Object.values(services).every((state) => state === 'up');

  res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'degraded', service: 'gateway-service', services });
});

app.use(globalLimiter());
app.use(['/api/auth/login', '/api/auth/signup'], authLimiter());
app.use(accessControl);
app.use(buildProxies());

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  req.log.error({ err: error }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
