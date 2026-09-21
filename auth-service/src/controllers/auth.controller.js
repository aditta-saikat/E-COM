const { validationResult } = require('express-validator');
const { signAccessToken } = require('../config/jwt');
const { createUser, verifyCredentials } = require('../services/user.service');

const toSafeUser = (user) => ({
  _id: user._id,
  email: user.email,
  displayName: user.displayName,
  role: user.role,
});

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, displayName } = req.body;
    const user = await createUser({ email, password, displayName });
    const token = signAccessToken(user);

    req.log.info({ userId: user._id, email }, 'User signed up');

    return res.status(201).json({ token, user: toSafeUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      req.log.warn({ email: req.body.email }, 'Signup rejected: email already in use');
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    return next(error);
  }
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await verifyCredentials(email, password);

    if (!user) {
      req.log.warn({ email }, 'Login failed: invalid credentials');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signAccessToken(user);

    req.log.info({ userId: user._id, email }, 'User logged in');

    return res.status(200).json({ token, user: toSafeUser(user) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { signup, login };
