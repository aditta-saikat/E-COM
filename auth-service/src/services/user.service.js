const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const SALT_ROUNDS = 10;

const createUser = async ({ email, password, displayName }) => {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return User.create({
    email,
    password: passwordHash,
    displayName: displayName || '',
  });
};

const verifyCredentials = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user || !user.isActive) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  return passwordMatches ? user : null;
};

const getUserById = async (id) => User.findById(id);

const updateUserProfile = async (id, updates) => {
  return User.findByIdAndUpdate(
    id,
    { $set: updates },
    { returnDocument: 'after', runValidators: true },
  );
};

const setUserRole = async (id, role) => {
  return User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { returnDocument: 'after', runValidators: true },
  );
};

module.exports = {
  createUser,
  verifyCredentials,
  getUserById,
  updateUserProfile,
  setUserRole,
};
