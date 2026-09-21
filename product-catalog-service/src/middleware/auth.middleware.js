const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  try {
    const authorization = req.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'A Bearer token is required' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = authorization.slice('Bearer '.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { uid: decoded.sub, email: decoded.email, role: decoded.role };

    return next();
  } catch (error) {
    req.log.debug({ err: error }, 'Token verification failed');
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    req.log.warn({ userId: req.user?.uid, role: req.user?.role, path: req.path }, 'Forbidden: role not permitted');
    return res.status(403).json({ error: 'You do not have permission to access this resource' });
  }

  return next();
};

const attachUserIfPresent = (req, res, next) => {
  const authorization = req.get('authorization');

  if (!authorization || !authorization.startsWith('Bearer ') || !process.env.JWT_SECRET) {
    return next();
  }

  try {
    const token = authorization.slice('Bearer '.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { uid: decoded.sub, email: decoded.email, role: decoded.role };
  } catch (error) {
    // an invalid/expired token on this optional route just means "treat as anonymous"
  }

  return next();
};

module.exports = { requireAuth, requireRole, attachUserIfPresent };
