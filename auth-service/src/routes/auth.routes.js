const { Router } = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');

const router = Router();

const credentialsValidationRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 6 }),
];

router.post(
  '/signup',
  [...credentialsValidationRules, body('displayName').optional().isString().trim()],
  authController.signup,
);
router.post('/login', credentialsValidationRules, authController.login);

module.exports = router;
