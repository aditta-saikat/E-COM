const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const RefreshToken = require('../models/RefreshToken');

/**
 * Generate JWT Access Token
 * @param {object} user - User object
 * @returns {string} JWT access token
 */
const generateAccessToken = (user) => {
  const payload = {
    userId: user._id,
    firebaseUid: user.firebaseUid,
    email: user.email,
    role: user.role,
    type: 'access',
  };

  return jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiry,
    issuer: 'auth-service',
    audience: 'ecommerce-platform',
  });
};

/**
 * Generate JWT Refresh Token
 * @param {object} user - User object
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    firebaseUid: user.firebaseUid,
    type: 'refresh',
  };

  return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
    expiresIn: jwtConfig.refreshTokenExpiry,
    issuer: 'auth-service',
    audience: 'ecommerce-platform',
  });
};

/**
 * Store Refresh Token in Database
 * @param {string} userId - User ID
 * @param {string} firebaseUid - Firebase UID
 * @param {string} token - Refresh token
 * @param {object} deviceInfo - Device information
 * @returns {Promise<object>} Saved refresh token document
 */
const storeRefreshToken = async (userId, firebaseUid, token, deviceInfo) => {
  // Calculate expiry date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const refreshToken = new RefreshToken({
    userId,
    firebaseUid,
    token,
    expiresAt,
    deviceInfo,
  });

  return await refreshToken.save();
};

/**
 * Verify JWT Access Token
 * @param {string} token - JWT access token
 * @returns {object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.accessTokenSecret, {
      issuer: 'auth-service',
      audience: 'ecommerce-platform',
    });
  } catch (error) {
    throw new Error(`Invalid access token: ${error.message}`);
  }
};

/**
 * Verify JWT Refresh Token
 * @param {string} token - JWT refresh token
 * @returns {object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshTokenSecret, {
      issuer: 'auth-service',
      audience: 'ecommerce-platform',
    });
  } catch (error) {
    throw new Error(`Invalid refresh token: ${error.message}`);
  }
};

/**
 * Validate Refresh Token from Database
 * @param {string} token - Refresh token
 * @returns {Promise<object|null>} Refresh token document or null
 */
const validateRefreshToken = async (token) => {
  const tokenDoc = await RefreshToken.findOne({
    token,
    isRevoked: false,
  });

  if (!tokenDoc) {
    return null;
  }

  if (tokenDoc.isExpired()) {
    await tokenDoc.revoke();
    return null;
  }

  return tokenDoc;
};

/**
 * Revoke Refresh Token
 * @param {string} token - Refresh token to revoke
 * @returns {Promise<boolean>} Success status
 */
const revokeRefreshToken = async (token) => {
  const tokenDoc = await RefreshToken.findOne({ token });
  
  if (!tokenDoc) {
    return false;
  }

  await tokenDoc.revoke();
  return true;
};

/**
 * Generate Both Access and Refresh Tokens
 * @param {object} user - User object
 * @param {object} deviceInfo - Device information
 * @returns {Promise<object>} Object containing both tokens
 */
const generateTokenPair = async (user, deviceInfo) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token in database
  await storeRefreshToken(user._id, user.firebaseUid, refreshToken, deviceInfo);

  return {
    accessToken,
    refreshToken,
    expiresIn: jwtConfig.accessTokenExpiry,
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  generateTokenPair,
};