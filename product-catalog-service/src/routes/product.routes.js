const { Router } = require('express');
const { body } = require('express-validator');

const productController = require('../controllers/product.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireInternalKey } = require('../middleware/internal.middleware');

const router = Router();

const productValidationRules = [
  body('name').isString().trim().notEmpty(),
  body('price').isInt({ min: 0 }),
  body('sku').isString().trim().notEmpty(),
  body('stock').optional().isInt({ min: 0 }),
  body('category').optional().isString().trim(),
];

const stockAdjustmentRules = [body('quantity').isInt({ min: 1 })];

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', requireAuth, productValidationRules, productController.createProduct);
router.patch('/:id', requireAuth, productController.updateProduct);
router.delete('/:id', requireAuth, productController.deleteProduct);

router.post('/verify', requireInternalKey, productController.verifyProducts);
router.post(
  '/:id/stock/decrement',
  requireInternalKey,
  stockAdjustmentRules,
  productController.decrementStock,
);
router.post(
  '/:id/stock/increment',
  requireInternalKey,
  stockAdjustmentRules,
  productController.incrementStock,
);

module.exports = router;
