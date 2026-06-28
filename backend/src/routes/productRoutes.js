const express = require('express');
const router = express.Router();
const {
  getProducts, getProductById, getProductBySlug, createProduct, updateProduct,
  deleteProduct, addReview, deleteProductImage,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.post('/', protect, admin, upload.array('images', 8), createProduct);
router.put('/:id', protect, admin, upload.array('images', 8), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, addReview);
router.delete('/:id/images/:imageIndex', protect, admin, deleteProductImage);

module.exports = router;
