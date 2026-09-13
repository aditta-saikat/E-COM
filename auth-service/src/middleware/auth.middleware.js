const { verifyAccessToken } = require('../config/jwt');
const { getUserById } = require('../services/user.service');

const requireAuth = async (req, res, next) => {
  try {
    const authorization = req.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'A Bearer token is required' });
    }

    const token = authorization.slice('Bearer '.length);
    const decoded = verifyAccessToken(token);
    const user = await getUserById(decoded.sub);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }

    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ error: 'You do not have permission to access this resource' });
  }

  return next();
};

module.exports = { requireAuth, requireRole };
