const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc   Get user wishlist
// @route  GET /api/wishlist
// @access Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    populate: { path: 'category', select: 'name slug type' },
    match: { isActive: true },
  });
  res.json({ success: true, count: user.wishlist.length, data: user.wishlist });
});

// @desc   Add product to wishlist
// @route  POST /api/wishlist/:productId
// @access Private
const addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { productId } = req.params;

  if (user.wishlist.includes(productId)) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  user.wishlist.push(productId);
  await user.save();
  res.json({ success: true, message: 'Added to wishlist' });
});

// @desc   Remove product from wishlist
// @route  DELETE /api/wishlist/:productId
// @access Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { productId } = req.params;

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();
  res.json({ success: true, message: 'Removed from wishlist' });
});

// @desc   Toggle product in wishlist
// @route  POST /api/wishlist/:productId/toggle
// @access Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { productId } = req.params;

  const idx = user.wishlist.findIndex((id) => id.toString() === productId);
  let added;

  if (idx > -1) {
    user.wishlist.splice(idx, 1);
    added = false;
  } else {
    user.wishlist.push(productId);
    added = true;
  }

  await user.save();
  res.json({ success: true, added, message: added ? 'Added to wishlist' : 'Removed from wishlist' });
});

// @desc   Clear entire wishlist
// @route  DELETE /api/wishlist
// @access Private
const clearWishlist = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { wishlist: [] });
  res.json({ success: true, message: 'Wishlist cleared' });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist };
