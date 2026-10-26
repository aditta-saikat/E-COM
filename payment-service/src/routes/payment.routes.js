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
    body('customer').optional().isObject(),
  ],
  paymentController.charge,
);

// Public: called by SSLCommerz, trusted only after the payment is verified with SSLCommerz.
router.all('/sslcommerz/success', paymentController.sslcommerzCallback('success'));
router.all('/sslcommerz/fail', paymentController.sslcommerzCallback('fail'));
router.all('/sslcommerz/cancel', paymentController.sslcommerzCallback('cancel'));
router.all('/sslcommerz/ipn', paymentController.sslcommerzCallback('ipn'));

router.get('/lookup', requireInternalKey, query('orderId').isString().notEmpty(), paymentController.getPaymentByOrder);
router.get('/:id', requireInternalKey, paymentController.getPayment);

module.exports = router;
