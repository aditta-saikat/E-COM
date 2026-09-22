const { Router } = require('express');
const { body, query } = require('express-validator');

const paymentController = require('../controllers/payment.controller');
const { requireInternalKey } = require('../middleware/internal.middleware');

const router = Router();

router.post(
  '/',
  requireInternalKey,
  [
    body('orderId').isString().notEmpty(),
    body('userId').isString().notEmpty(),
    body('amount').isInt({ min: 0 }),
    body('currency').isString().notEmpty(),
  ],
  paymentController.charge,
);

router.get('/lookup', requireInternalKey, query('orderId').isString().notEmpty(), paymentController.getPaymentByOrder);
router.get('/:id', requireInternalKey, paymentController.getPayment);

module.exports = router;
