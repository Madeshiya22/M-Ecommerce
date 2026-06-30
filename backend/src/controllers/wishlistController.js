const asyncHandler = require('express-async-handler');
const wishlistService = require('../services/wishlistService');

// @desc   Get user wishlist
// @route  GET /api/wishlist
// @access Private
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user._id);
  res.json({ success: true, count: wishlist.length, data: wishlist });
});

// @desc   Add product to wishlist
// @route  POST /api/wishlist/:productId
// @access Private
const addToWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.addToWishlist(req.user._id, req.params.productId);
  res.json({ success: true, message: result.message });
});

// @desc   Remove product from wishlist
// @route  DELETE /api/wishlist/:productId
// @access Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.removeFromWishlist(req.user._id, req.params.productId);
  res.json({ success: true, message: result.message });
});

// @desc   Toggle product in wishlist
// @route  POST /api/wishlist/:productId/toggle
// @access Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.toggleWishlist(req.user._id, req.params.productId);
  res.json({ success: true, added: result.added, message: result.message });
});

// @desc   Clear entire wishlist
// @route  DELETE /api/wishlist
// @access Private
const clearWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.clearWishlist(req.user._id);
  res.json({ success: true, message: result.message });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist };
