const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByNaturalQuery,
  createProductReview,
  deleteProductReview
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/natural-search', getProductsByNaturalQuery);

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/reviews')
  .post(protect, createProductReview);

router.route('/:id/reviews/:reviewId')
  .delete(protect, admin, deleteProductReview);

module.exports = router;
