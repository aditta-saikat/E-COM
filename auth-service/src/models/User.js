const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    photoURL: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ['google', 'email', 'phone'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    metadata: {
      loginCount: {
        type: Number,
        default: 0,
      },
      lastLoginIp: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ firebaseUid: 1, role: 1 });

// Method to update last login
userSchema.methods.updateLastLogin = function (ip, userAgent) {
  this.lastLogin = new Date();
  this.metadata.loginCount += 1;
  this.metadata.lastLoginIp = ip;
  this.metadata.userAgent = userAgent;
  return this.save();
};

// Method to check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

// Virtual for full name (if you want to add firstName/lastName later)
userSchema.virtual('fullName').get(function () {
  return this.displayName || this.email.split('@')[0];
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);