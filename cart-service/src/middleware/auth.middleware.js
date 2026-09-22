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

module.exports = { requireAuth };
