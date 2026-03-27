const { errorResponse } = require('../utils/responseUtils');

/**
 * Role-Based Access Control Middleware
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required');
    }

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Admin Only Middleware
 */
const adminOnly = authorize('admin');

/**
 * User Or Admin Middleware
 */
const userOrAdmin = authorize('user', 'admin');

module.exports = {
  authorize,
  adminOnly,
  userOrAdmin,
};