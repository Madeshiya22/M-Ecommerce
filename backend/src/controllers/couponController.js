const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc   Get all coupons (Admin)
// @route  GET /api/admin/coupons
// @access Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const { isActive, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Coupon.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: coupons,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// @desc   Get coupon by code (Public — for apply flow)
// @route  GET /api/coupons/:code
// @access Private
const getCouponByCode = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  // Return limited info for public
  res.json({
    success: true,
    data: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
      isValid: coupon.isValid,
      endDate: coupon.endDate,
    },
  });
});

// @desc   Apply coupon to an order total
// @route  POST /api/coupons/apply
// @access Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;

  if (!code || !orderTotal) {
    res.status(400);
    throw new Error('Code and orderTotal are required');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  const now = new Date();
  if (!coupon.isActive || now < coupon.startDate || now > coupon.endDate) {
    res.status(400);
    throw new Error('Coupon is expired or inactive');
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  if (orderTotal < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount} to use this coupon`);
  }

  // Check per-user usage
  if (req.user) {
    const userUseCount = coupon.usedBy.filter((id) => id.toString() === req.user._id.toString()).length;
    if (userUseCount >= coupon.userUsageLimit) {
      res.status(400);
      throw new Error('You have already used this coupon');
    }
  }

  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = Math.round((orderTotal * coupon.value) / 100);
    if (coupon.maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else {
    discountAmount = coupon.value;
  }

  discountAmount = Math.min(discountAmount, orderTotal);

  res.json({
    success: true,
    data: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      finalAmount: orderTotal - discountAmount,
    },
  });
});

// @desc   Create coupon (Admin)
// @route  POST /api/admin/coupons
// @access Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

// @desc   Update coupon (Admin)
// @route  PUT /api/admin/coupons/:id
// @access Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  const updated = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: updated });
});

// @desc   Delete coupon (Admin)
// @route  DELETE /api/admin/coupons/:id
// @access Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  await coupon.deleteOne();
  res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = { getCoupons, getCouponByCode, applyCoupon, createCoupon, updateCoupon, deleteCoupon };
