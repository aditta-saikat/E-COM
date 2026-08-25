const User = require('../models/user.model');

const getOrCreateUser = async (firebaseUser) => {
  return User.findOneAndUpdate(
    { firebaseUid: firebaseUser.uid },
    {
      $set: {
        email: firebaseUser.email || '',
        displayName: firebaseUser.name || '',
        photoUrl: firebaseUser.picture || '',
      },
      $setOnInsert: {
        firebaseUid: firebaseUser.uid,
        role: 'customer',
        isActive: true,
      },
    },
    { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();
};

const updateUserProfile = async (firebaseUid, updates) => {
  return User.findOneAndUpdate(
    { firebaseUid },
    { $set: updates },
    { returnDocument: 'after', runValidators: true },
  ).lean();
};

module.exports = { getOrCreateUser, updateUserProfile };