const express = require('express');
const router = express.Router();
const {
  getWishlist, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect); // All wishlist routes require auth

router.get('/', getWishlist);
router.delete('/', clearWishlist);
router.post('/:productId', addToWishlist);
router.post('/:productId/toggle', toggleWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
