const jwt = require('jsonwebtoken');
const { findService, accessFor } = require('../config/routes');

// Decides, before anything is forwarded: unknown route -> 404, internal route -> 404, protected route without a
// valid token -> 401. The services still verify the token themselves (defence in depth); the gateway just stops
// bad requests early and keeps them off the services entirely.
const accessControl = (req, res, next) => {
  if (!findService(req.path)) {
    return res.status(404).json({ error: 'Route not found' });
  }

  const access = accessFor(req.method, req.path);

  if (access === 'blocked') {
    req.log.warn({ path: req.path }, 'Blocked request to an internal-only route');
    return res.status(404).json({ error: 'Route not found' });
  }

  if (access === 'public') {
    return next();
  }

  const authorization = req.get('authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'A Bearer token is required' });
  }

  try {
    jwt.verify(authorization.slice('Bearer '.length), process.env.JWT_SECRET);
    return next();
  } catch (error) {
    req.log.debug({ err: error }, 'Token rejected at the gateway');
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

module.exports = accessControl;
