const express = require('express');
const router = express.Router();
const {
  getProducts, getProductById, getProductBySlug, createProduct, updateProduct,
  deleteProduct, addReview, deleteProductImage,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Admin product routes
router.post('/', protect, admin, upload.array('images', 8), createProduct);
router.put('/:id', protect, admin, upload.array('images', 8), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.delete('/:id/images/:imageIndex', protect, admin, deleteProductImage);

// Authenticated user routes
router.post('/:id/reviews', protect, addReview);

module.exports = router;
