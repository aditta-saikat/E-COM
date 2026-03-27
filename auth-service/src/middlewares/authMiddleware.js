const { verifyAccessToken } = require('../utils/tokenUtils');
const { errorResponse } = require('../utils/responseUtils');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT access token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Access token is required');
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    const decoded = verifyAccessToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Account is deactivated');
    }

    // Attach user to request object
    req.user = user;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid access token');
    }
    
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Access token has expired');
    }

    return errorResponse(res, 401, 'Authentication failed');
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is present, but doesn't fail if absent
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = user;
      req.tokenPayload = decoded;
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};