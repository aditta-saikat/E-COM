const { validationResult } = require('express-validator');
const { updateUserProfile, setUserRole } = require('../services/user.service');

const getCurrentUser = (req, res) => {
  res.status(200).json({ user: req.user });
};

const updateCurrentUser = async (req, res, next) => {
  try {
    const allowedUpdates = {};

    if (typeof req.body.displayName === 'string') {
      allowedUpdates.displayName = req.body.displayName.trim();
    }

    const user = await updateUserProfile(req.user._id, allowedUpdates);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await setUserRole(req.params.id, req.body.role);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getCurrentUser, updateCurrentUser, updateUserRole };
