const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc   Create order
// @route  POST /api/orders
// @access Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Verify products and calculate prices
  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
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
    user: req.user._id,
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
  res.status(201).json({ success: true, data: order });
});

// @desc   Get my orders
// @route  GET /api/orders/myorders
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
});

// @desc   Get single order
// @route  GET /api/orders/:id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json({ success: true, data: order });
});

// ===== ADMIN =====

// @desc   Get all orders (Admin)
// @route  GET /api/orders
// @access Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, sort = 'newest' } = req.query;
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

  res.json({
    success: true,
    data: orders,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// @desc   Update order status (Admin)
// @route  PUT /api/orders/:id/status
// @access Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

  if (status === 'delivered') order.deliveredAt = Date.now();
  if (status === 'paid') order.paidAt = Date.now();

  await order.save();
  res.json({ success: true, data: order });
});

// @desc   Get order stats (Admin)
// @route  GET /api/orders/stats
// @access Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const [totalOrders, totalRevenue, pendingOrders, deliveredOrders] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'delivered' }),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      deliveredOrders,
    },
  });
});

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getOrderStats };

// @desc   Update shipping/tracking info (Admin)
// @route  PUT /api/orders/:id/tracking
// @access Private/Admin
const updateOrderTracking = asyncHandler(async (req, res) => {
  const { trackingNumber, trackingUrl, carrier, estimatedDelivery } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
  if (carrier !== undefined) order.carrier = carrier;
  if (estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery;

  order.statusHistory.push({ status: order.status, note: `Tracking updated: ${carrier || ''} ${trackingNumber || ''}`.trim() });
  await order.save();
  res.json({ success: true, data: order });
});

// @desc   Process refund (Admin)
// @route  PUT /api/orders/:id/refund
// @access Private/Admin
const processRefund = asyncHandler(async (req, res) => {
  const { refundStatus, refundAmount, refundReason } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const validStatuses = ['requested', 'processing', 'completed', 'rejected'];
  if (!validStatuses.includes(refundStatus)) {
    res.status(400);
    throw new Error('Invalid refund status');
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
  res.json({ success: true, data: order });
});

// @desc   Get sales analytics (Admin)
// @route  GET /api/admin/orders/analytics
// @access Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = '12' } = req.query; // months
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

  res.json({
    success: true,
    data: {
      monthlyRevenue,
      ordersByStatus: ordersByStatus.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
      topProducts,
      dailyOrders,
    },
  });
});

// Re-export everything including new functions
module.exports = Object.assign(module.exports, {
  updateOrderTracking, processRefund, getSalesAnalytics,
});
