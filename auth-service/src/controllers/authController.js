const {
  verifyFirebaseToken,
  setCustomClaims,
  getFirebaseUser,
} = require('../config/firebase');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateTokenPair, validateRefreshToken, verifyRefreshToken, revokeRefreshToken } = require('../utils/tokenUtils');
const { successResponse, errorResponse } = require('../utils/responseUtils');

/**
 * @desc    Register/Login with Firebase (Google Auth or Email)
 * @route   POST /api/auth/firebase-login
 * @access  Public
 */
const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    // Verify Firebase ID token
    const decodedToken = await verifyFirebaseToken(idToken);
    
    // Get full Firebase user data
    const firebaseUser = await getFirebaseUser(decodedToken.uid);

    // Extract device info
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
    };

    // Check if user exists in our database
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      // Create new user
      const provider = firebaseUser.providerData[0]?.providerId === 'google.com' 
        ? 'google' 
        : firebaseUser.providerData[0]?.providerId === 'phone' 
        ? 'phone' 
        : 'email';

      user = new User({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || firebaseUser.email,
        displayName: decodedToken.name || firebaseUser.displayName,
        photoURL: decodedToken.picture || firebaseUser.photoURL,
        phoneNumber: decodedToken.phone_number || firebaseUser.phoneNumber,
        isEmailVerified: decodedToken.email_verified || false,
        provider,
        role: 'user', // Default role
      });

      await user.save();
      console.log(`✅ New user created: ${user.email}`);
    }

    // Update last login
    await user.updateLastLogin(deviceInfo.ip, deviceInfo.userAgent);

    // Sync custom claims with Firebase (for role-based access in Firebase)
    await setCustomClaims(user.firebaseUid, { role: user.role });

    // Generate JWT tokens
    const tokens = await generateTokenPair(user, deviceInfo);

    // Prepare user response (exclude sensitive data)
    const userResponse = {
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      provider: user.provider,
      createdAt: user.createdAt,
    };

    return successResponse(res, 200, 'Login successful', {
      user: userResponse,
      tokens,
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    return errorResponse(res, 401, error.message || 'Authentication failed');
  }
};

/**
 * @desc    Refresh Access Token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Verify JWT refresh token structure
    const decoded = verifyRefreshToken(refreshToken);

    // Validate refresh token from database
    const tokenDoc = await validateRefreshToken(refreshToken);

    if (!tokenDoc) {
      return errorResponse(res, 401, 'Invalid or expired refresh token');
    }

    // Get user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Account is deactivated');
    }

    // Extract device info
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
    };

    // Revoke old refresh token
    await tokenDoc.revoke();

    // Generate new token pair
    const tokens = await generateTokenPair(user, deviceInfo);

    return successResponse(res, 200, 'Token refreshed successfully', { tokens });
  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse(res, 401, error.message || 'Token refresh failed');
  }
};

/**
 * @desc    Logout (Revoke Refresh Token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Optionally revoke all tokens for this user
    // await RefreshToken.revokeAllForUser(req.user._id);

    return successResponse(res, 200, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 500, 'Logout failed');
  }
};

/**
 * @desc    Get Current User Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;

    const userResponse = {
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      provider: user.provider,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      metadata: user.metadata,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse(res, 200, 'User profile fetched successfully', { user: userResponse });
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 500, 'Failed to fetch user profile');
  }
};

/**
 * @desc    Update User Role (Admin Only)
 * @route   PUT /api/auth/users/:userId/role
 * @access  Private (Admin)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    // Prevent self-demotion
    if (req.user._id.toString() === userId && role !== 'admin') {
      return errorResponse(res, 403, 'Cannot change your own role');
    }

    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Update role in our database
    user.role = role;
    await user.save();

    // Sync with Firebase custom claims
    await setCustomClaims(user.firebaseUid, { role: user.role });

    // Revoke all existing tokens to force re-authentication with new role
    await RefreshToken.revokeAllForUser(user._id);

    return successResponse(res, 200, `User role updated to ${role}`, {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update role error:', error);
    return errorResponse(res, 500, 'Failed to update user role');
  }
};

/**
 * @desc    Get All Users (Admin Only)
 * @route   GET /api/auth/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return errorResponse(res, 500, 'Failed to fetch users');
  }
};

/**
 * @desc    Verify Token Validity
 * @route   GET /api/auth/verify-token
 * @access  Private
 */
const verifyToken = async (req, res, next) => {
  try {
    // Token is already verified by authenticate middleware
    return successResponse(res, 200, 'Token is valid', {
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    return errorResponse(res, 401, 'Invalid token');
  }
};

module.exports = {
  firebaseLogin,
  refreshAccessToken,
  logout,
  getCurrentUser,
  updateUserRole,
  getAllUsers,
  verifyToken,
};