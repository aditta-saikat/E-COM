const { Router } = require('express');

const orderController = require('../controllers/order.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { requireInternalKey } = require('../middleware/internal.middleware');

const router = Router();

router.post('/', requireAuth, orderController.createOrder);
router.get('/', requireAuth, orderController.listOrders);
// Internal: payment-service reports how a redirect payment ended.
router.post('/:id/payment-result', requireInternalKey, orderController.applyPaymentResult);
router.get('/admin', requireAuth, requireRole('admin'), orderController.listAllOrders);
router.get('/:id', requireAuth, orderController.getOrder);

module.exports = router;
