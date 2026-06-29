const express = require('express');
const router = express.Router();
const {
  getCouponByCode, applyCoupon,
} = require('../controllers/couponController');
const { protect } = require('../middleware/auth');

// Public coupon routes (authenticated users)
router.get('/:code', protect, getCouponByCode);
router.post('/apply', protect, applyCoupon);

module.exports = router;
