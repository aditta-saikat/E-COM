const { getFirebaseAuth } = require('../config/firebase');
const { getOrCreateUser } = require('../services/user.service');

const requireAuth = async (req, res, next) => {
  try {
    const authorization = req.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'A Bearer token is required' });
    }

    const idToken = authorization.slice('Bearer '.length);
    const firebaseUser = await getFirebaseAuth().verifyIdToken(idToken);
    req.user = await getOrCreateUser(firebaseUser);

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