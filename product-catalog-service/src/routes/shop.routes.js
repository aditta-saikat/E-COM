const { Router } = require('express');
const { body } = require('express-validator');

const shopController = require('../controllers/shop.controller');
const { requireAuth, requireRole, attachUserIfPresent } = require('../middleware/auth.middleware');

const router = Router();

const shopValidationRules = [
  body('name').isString().trim().notEmpty(),
  body('description').optional().isString().trim(),
];

router.get('/', attachUserIfPresent, shopController.listShops);
router.get('/pending', requireAuth, requireRole('admin'), shopController.listPendingShops);
router.get('/mine', requireAuth, shopController.getMyShop);
router.get('/:id', shopController.getShop);

router.post('/', requireAuth, shopValidationRules, shopController.requestShop);
router.patch('/:id', requireAuth, shopController.updateShop);

router.post('/:id/approve', requireAuth, requireRole('admin'), shopController.approveShop);
router.post('/:id/reject', requireAuth, requireRole('admin'), shopController.rejectShop);

module.exports = router;
