const { getFirebaseAuth } = require('../config/firebase');

const requireAuth = async (req, res, next) => {
  try {
    const authorization = req.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'A Bearer token is required' });
    }

    const idToken = authorization.slice('Bearer '.length);
    const firebaseUser = await getFirebaseAuth().verifyIdToken(idToken);
    req.user = { uid: firebaseUser.uid, email: firebaseUser.email };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

module.exports = { requireAuth };
