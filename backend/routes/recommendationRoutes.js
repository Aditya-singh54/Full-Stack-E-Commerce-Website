const express = require('express');
const router = express.Router();
const {
  trackProductView,
  getRecommendations
} = require('../controllers/recommendationController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.post('/view', protect, trackProductView);
router.get('/', optionalProtect, getRecommendations);

module.exports = router;
