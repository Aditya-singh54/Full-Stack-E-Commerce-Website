const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getMyOrders,
  getOrderById
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Secure all endpoints with token auth middleware
router.use(protect);

router.route('/')
  .post(addOrderItems);

router.route('/my-orders')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

module.exports = router;
