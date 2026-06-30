const User = require('../models/User');
const AppError = require('../utils/AppError');

const getWishlist = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'wishlist',
    populate: { path: 'category', select: 'name slug type' },
    match: { isActive: true },
  });
  return user.wishlist;
};

const addToWishlist = async (userId, productId) => {
  const user = await User.findById(userId);

  if (user.wishlist.includes(productId)) {
    throw new AppError('Product already in wishlist', 400);
  }

  user.wishlist.push(productId);
  await user.save();
  return { message: 'Added to wishlist' };
};

const removeFromWishlist = async (userId, productId) => {
  const user = await User.findById(userId);

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();
  return { message: 'Removed from wishlist' };
};

const toggleWishlist = async (userId, productId) => {
  const user = await User.findById(userId);

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
  return { added, message: added ? 'Added to wishlist' : 'Removed from wishlist' };
};

const clearWishlist = async (userId) => {
  await User.findByIdAndUpdate(userId, { wishlist: [] });
  return { message: 'Wishlist cleared' };
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
};
