const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    deviceInfo: {
      userAgent: String,
      ip: String,
      deviceType: String, // 'mobile', 'desktop', 'tablet'
    },
  },
  {
    timestamps: true,
  }
);

// TTL index - automatically delete expired tokens after 30 days
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2592000 });

// Index for faster queries
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ token: 1, isRevoked: 1 });

// Method to check if token is expired
refreshTokenSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

// Method to revoke token
refreshTokenSchema.methods.revoke = function () {
  this.isRevoked = true;
  return this.save();
};

// Static method to clean up expired tokens
refreshTokenSchema.statics.cleanupExpired = async function () {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  console.log(`Cleaned up ${result.deletedCount} expired tokens`);
  return result;
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllForUser = async function (userId) {
  const result = await this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
  console.log(`Revoked ${result.modifiedCount} tokens for user ${userId}`);
  return result;
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);