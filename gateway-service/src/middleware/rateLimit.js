const { rateLimit } = require('express-rate-limit');

const perMinute = (name, fallback) => Number(process.env[name]) || fallback;

const tooMany = (req, res) => res.status(429).json({ error: 'Too many requests, slow down and try again shortly' });

// Per IP, across every route.
const globalLimiter = () =>
  rateLimit({
    windowMs: 60 * 1000,
    limit: perMinute('RATE_LIMIT_PER_MINUTE', 300),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: tooMany,
  });

// Much tighter on login and signup, to slow down password guessing.
const authLimiter = () =>
  rateLimit({
    windowMs: 60 * 1000,
    limit: perMinute('AUTH_RATE_LIMIT_PER_MINUTE', 20),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: tooMany,
  });

module.exports = { globalLimiter, authLimiter };
