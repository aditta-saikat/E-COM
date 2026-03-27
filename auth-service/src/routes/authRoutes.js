const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');
const {
  validateFirebaseToken,
  validateRefreshToken,
  validateRoleUpdate,
} = require('../validators/authValidator');

/**
 * @route   POST /api/auth/firebase-login
 * @desc    Login/Register with Firebase
 * @access  Public
 */
router.post('/firebase-login', validateFirebaseToken, authController.firebaseLogin);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', validateRefreshToken, authController.refreshAccessToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (revoke refresh token)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify token validity
 * @access  Private
 */
router.get('/verify-token', authenticate, authController.verifyToken);

/**
 * @route   PUT /api/auth/users/role
 * @desc    Update user role
 * @access  Private (Admin Only)
 */
router.put('/users/role', authenticate, adminOnly, validateRoleUpdate, authController.updateUserRole);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (with pagination)
 * @access  Private (Admin Only)
 */
router.get('/users', authenticate, adminOnly, authController.getAllUsers);

module.exports = router;