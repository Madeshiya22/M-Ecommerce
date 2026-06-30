const asyncHandler = require('express-async-handler');
const orderService = require('../services/orderService');

// @desc   Create order
// @route  POST /api/orders
// @access Private
const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user, req.body);
  res.status(201).json({ success: true, data: order });
});

// @desc   Get my orders
// @route  GET /api/orders/myorders
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { count, orders } = await orderService.getMyOrders(req.user._id);
  res.json({ success: true, count, data: orders });
});

// @desc   Get single order
// @route  GET /api/orders/:id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user);
  res.json({ success: true, data: order });
});

// ===== ADMIN =====

// @desc   Get all orders (Admin)
// @route  GET /api/orders
// @access Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { orders, pagination } = await orderService.getAllOrders(req.query);
  res.json({
    success: true,
    data: orders,
    pagination,
  });
});

// @desc   Update order status (Admin)
// @route  PUT /api/orders/:id/status
// @access Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body);
  res.json({ success: true, data: order });
});

// @desc   Get order stats (Admin)
// @route  GET /api/orders/stats
// @access Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const data = await orderService.getOrderStats();
  res.json({ success: true, data });
});

// @desc   Update shipping/tracking info (Admin)
// @route  PUT /api/orders/:id/tracking
// @access Private/Admin
const updateOrderTracking = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderTracking(req.params.id, req.body);
  res.json({ success: true, data: order });
});

// @desc   Process refund (Admin)
// @route  PUT /api/orders/:id/refund
// @access Private/Admin
const processRefund = asyncHandler(async (req, res) => {
  const order = await orderService.processRefund(req.params.id, req.body);
  res.json({ success: true, data: order });
});

// @desc   Get sales analytics (Admin)
// @route  GET /api/admin/orders/analytics
// @access Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const data = await orderService.getSalesAnalytics(req.query);
  res.json({ success: true, data });
});

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
