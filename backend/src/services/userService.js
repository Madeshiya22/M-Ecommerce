const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

const getAllUsers = async ({ page = 1, limit = 20, keyword }) => {
  const filter = {};
  if (keyword) filter.$or = [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  return { users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } };
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const updateUser = async (id, data) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  
  const { name, email, role, isActive } = data;
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  return await user.save();
};

const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  await user.deleteOne();
  return { message: 'User deleted successfully' };
};

const getDashboardStats = async () => {
  const [
    totalUsers, totalProducts, totalOrders, revenueAgg,
    recentOrders, topProducts, lowStockProducts,
    pendingOrders, processingOrders, shippedOrders,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    Product.find().sort({ soldCount: -1 }).limit(5).select('name soldCount images price discountPrice'),
    Product.find({ stock: { $gt: 0, $lte: 10 }, isActive: true })
      .sort({ stock: 1 })
      .limit(10)
      .select('name stock sku images category type'),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'processing' }),
    Order.countDocuments({ status: 'shipped' }),
  ]);

  // Monthly revenue for chart (last 12 months)
  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  // Today's stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [todayOrders, todayRevenue] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenueAgg[0]?.total || 0,
    recentOrders,
    topProducts,
    lowStockProducts,
    ordersByStatus: { pending: pendingOrders, processing: processingOrders, shipped: shippedOrders },
    monthlyRevenue: monthlyRevenue.reverse(),
    today: {
      orders: todayOrders,
      revenue: todayRevenue[0]?.total || 0,
    },
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats
};
