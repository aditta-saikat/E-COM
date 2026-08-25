const { updateUserProfile } = require('../services/user.service');

const getCurrentUser = (req, res) => {
  res.status(200).json({ user: req.user });
};

const updateCurrentUser = async (req, res, next) => {
  try {
    const allowedUpdates = {};

    if (typeof req.body.displayName === 'string') {
      allowedUpdates.displayName = req.body.displayName.trim();
    }

    if (typeof req.body.photoUrl === 'string') {
      allowedUpdates.photoUrl = req.body.photoUrl.trim();
    }

    const user = await updateUserProfile(req.user.firebaseUid, allowedUpdates);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCurrentUser, updateCurrentUser };