const crypto = require('node:crypto');

// Every request gets one ID that follows it through the gateway and into the services (X-Request-Id), so a single
// checkout can be traced across five logs.
const requestId = (req, res, next) => {
  const incoming = req.get('x-request-id');
  req.id = incoming && /^[\w-]{8,64}$/.test(incoming) ? incoming : crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

module.exports = requestId;
