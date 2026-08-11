const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  getOrders,
  updateOrderStatus
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Secure all admin endpoints with protect and admin checks
router.use(protect, admin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
