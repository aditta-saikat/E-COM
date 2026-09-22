const { Router } = require('express');
const { body } = require('express-validator');

const cartController = require('../controllers/cart.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.get('/', requireAuth, cartController.getCart);
router.post(
  '/items',
  requireAuth,
  [body('productId').isString().notEmpty(), body('quantity').isInt({ min: 1 })],
  cartController.addItem,
);
router.patch(
  '/items/:productId',
  requireAuth,
  body('quantity').isInt({ min: 0 }),
  cartController.updateItem,
);
router.delete('/items/:productId', requireAuth, cartController.removeItem);
router.delete('/', requireAuth, cartController.clearCart);

module.exports = router;
