const { body, validationResult } = require('express-validator');

/**
 * Validation middleware wrapper
 */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors,
    });
  };
};

/**
 * Firebase Token Validation
 */
const validateFirebaseToken = validate([
  body('idToken')
    .notEmpty()
    .withMessage('Firebase ID token is required')
    .isString()
    .withMessage('Firebase ID token must be a string'),
]);

/**
 * Refresh Token Validation
 */
const validateRefreshToken = validate([
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string'),
]);

/**
 * Role Update Validation
 */
const validateRoleUpdate = validate([
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"'),
]);

module.exports = {
  validateFirebaseToken,
  validateRefreshToken,
  validateRoleUpdate,
};