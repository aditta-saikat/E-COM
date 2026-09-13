const express = require('express');
const { body } = require('express-validator');

const { getCurrentUser, updateCurrentUser, updateUserRole } = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireInternalKey } = require('../middleware/internal.middleware');

const router = express.Router();

router.get('/me', requireAuth, getCurrentUser);
router.patch('/me', requireAuth, updateCurrentUser);

router.patch(
  '/:id/role',
  requireInternalKey,
  body('role').isIn(['customer', 'shop_admin', 'admin']),
  updateUserRole,
);

module.exports = router;
