const Coupon = require('../models/Coupon');
const AppError = require('../utils/AppError');

const getCoupons = async (query) => {
  const { isActive, page = 1, limit = 20 } = query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Coupon.countDocuments(filter),
  ]);

  return { coupons, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } };
};

const getCouponByCode = async (code) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }
  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minOrderAmount: coupon.minOrderAmount,
    maxDiscount: coupon.maxDiscount,
    isValid: coupon.isValid,
    endDate: coupon.endDate,
  };
};

const applyCoupon = async (data, user) => {
  const { code, orderTotal } = data;

  if (!code || !orderTotal) {
    throw new AppError('Code and orderTotal are required', 400);
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    throw new AppError('Invalid coupon code', 404);
  }

  const now = new Date();
  if (!coupon.isActive || now < coupon.startDate || now > coupon.endDate) {
    throw new AppError('Coupon is expired or inactive', 400);
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError('Coupon usage limit reached', 400);
  }

  if (orderTotal < coupon.minOrderAmount) {
    throw new AppError(`Minimum order amount is ₹${coupon.minOrderAmount} to use this coupon`, 400);
  }

  // Check per-user usage
  if (user) {
    const userUseCount = coupon.usedBy.filter((id) => id.toString() === user._id.toString()).length;
    if (userUseCount >= coupon.userUsageLimit) {
      throw new AppError('You have already used this coupon', 400);
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

  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount,
    finalAmount: orderTotal - discountAmount,
  };
};

const createCoupon = async (data) => {
  const coupon = await Coupon.create(data);
  return coupon;
};

const updateCoupon = async (id, data) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }
  const updated = await Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  return updated;
};

const deleteCoupon = async (id) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }
  await coupon.deleteOne();
  return { message: 'Coupon deleted' };
};

module.exports = {
  getCoupons,
  getCouponByCode,
  applyCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
