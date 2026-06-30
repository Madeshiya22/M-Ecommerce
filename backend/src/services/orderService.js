const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

const createOrder = async (user, data) => {
  const { items, shippingAddress, paymentMethod, notes } = data;

  if (!items || items.length === 0) {
    throw new AppError('No order items', 400);
  }

  // Verify products and calculate prices
  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      throw new AppError(`Product not found: ${item.product}`, 404);
    }
    if (product.stock < item.qty) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    itemsPrice += price * item.qty;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price,
      qty: item.qty,
      size: item.size || '',
      color: item.color || '',
    });

    // Reduce stock
    product.stock -= item.qty;
    product.soldCount += item.qty;
    await product.save();
  }

  const shippingPrice = itemsPrice >= 999 ? 0 : 79;
  const taxPrice = Math.round(itemsPrice * 0.05);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const order = await Order.create({
    user: user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'cod',
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    notes,
    statusHistory: [{ status: 'pending', note: 'Order placed successfully' }],
  });

  await order.populate('user', 'name email');
  return order;
};

const getMyOrders = async (userId) => {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return { count: orders.length, orders };
};

const getOrderById = async (id, user) => {
  const order = await Order.findById(id).populate('user', 'name email');
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  if (order.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new AppError('Not authorized to view this order', 403);
  }
  return order;
};

const getAllOrders = async (query) => {
  const { status, page = 1, limit = 20, sort = 'newest' } = query;
  const filter = {};
  if (status) filter.status = status;

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    amount_high: { totalPrice: -1 },
    amount_low: { totalPrice: 1 },
  };
  const sortBy = sortOptions[sort] || { createdAt: -1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort(sortBy).skip(skip).limit(parseInt(limit)),
    Order.countDocuments(filter),
  ]);

  return { orders, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } };
};

const updateOrderStatus = async (id, data) => {
  const { status, note } = data;
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

  if (status === 'delivered') order.deliveredAt = Date.now();
  if (status === 'paid') order.paidAt = Date.now();

  await order.save();
  return order;
};

const getOrderStats = async () => {
  const [totalOrders, totalRevenue, pendingOrders, deliveredOrders] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'delivered' }),
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingOrders,
    deliveredOrders,
  };
};

const updateOrderTracking = async (id, data) => {
  const { trackingNumber, trackingUrl, carrier, estimatedDelivery } = data;
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
  if (carrier !== undefined) order.carrier = carrier;
  if (estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery;

  order.statusHistory.push({ status: order.status, note: `Tracking updated: ${carrier || ''} ${trackingNumber || ''}`.trim() });
  await order.save();
  return order;
};

const processRefund = async (id, data) => {
  const { refundStatus, refundAmount, refundReason } = data;
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const validStatuses = ['requested', 'processing', 'completed', 'rejected'];
  if (!validStatuses.includes(refundStatus)) {
    throw new AppError('Invalid refund status', 400);
  }

  order.refundStatus = refundStatus;
  if (refundAmount !== undefined) order.refundAmount = Number(refundAmount);
  if (refundReason !== undefined) order.refundReason = refundReason;
  if (refundStatus === 'completed') {
    order.refundProcessedAt = Date.now();
    order.paymentStatus = 'refunded';
  }

  order.statusHistory.push({ status: order.status, note: `Refund ${refundStatus}: ₹${order.refundAmount}` });
  await order.save();
  return order;
};

const getSalesAnalytics = async (query) => {
  const { period = '12' } = query; // months
  const months = Math.min(24, parseInt(period));

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const [monthlyRevenue, ordersByStatus, topProducts, dailyOrders] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
          avgOrder: { $avg: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          name: { $first: '$items.name' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    monthlyRevenue,
    ordersByStatus: ordersByStatus.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
    topProducts,
    dailyOrders,
  };
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  updateOrderTracking,
  processRefund,
  getSalesAnalytics,
};
