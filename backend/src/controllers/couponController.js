const asyncHandler = require('express-async-handler');
const couponService = require('../services/couponService');

// @desc   Get all coupons (Admin)
// @route  GET /api/admin/coupons
// @access Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const { coupons, pagination } = await couponService.getCoupons(req.query);
  res.json({
    success: true,
    data: coupons,
    pagination,
  });
});

// @desc   Get coupon by code (Public — for apply flow)
// @route  GET /api/coupons/:code
// @access Private
const getCouponByCode = asyncHandler(async (req, res) => {
  const data = await couponService.getCouponByCode(req.params.code);
  res.json({ success: true, data });
});

// @desc   Apply coupon to an order total
// @route  POST /api/coupons/apply
// @access Private
const applyCoupon = asyncHandler(async (req, res) => {
  const data = await couponService.applyCoupon(req.body, req.user);
  res.json({ success: true, data });
});

// @desc   Create coupon (Admin)
// @route  POST /api/admin/coupons
// @access Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  res.status(201).json({ success: true, data: coupon });
});

// @desc   Update coupon (Admin)
// @route  PUT /api/admin/coupons/:id
// @access Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const updated = await couponService.updateCoupon(req.params.id, req.body);
  res.json({ success: true, data: updated });
});

// @desc   Delete coupon (Admin)
// @route  DELETE /api/admin/coupons/:id
// @access Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const result = await couponService.deleteCoupon(req.params.id);
  res.json({ success: true, message: result.message });
});

module.exports = { getCoupons, getCouponByCode, applyCoupon, createCoupon, updateCoupon, deleteCoupon };
