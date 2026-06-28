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
