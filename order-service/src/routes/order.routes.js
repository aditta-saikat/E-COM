const { Router } = require('express');

const orderController = require('../controllers/order.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.post('/', requireAuth, orderController.createOrder);
router.get('/', requireAuth, orderController.listOrders);
router.get('/:id', requireAuth, orderController.getOrder);

module.exports = router;
