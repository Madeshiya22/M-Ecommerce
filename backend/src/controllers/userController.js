const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');

// @desc   Get all users
// @route  GET /api/users
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.getAllUsers(req.query);
  res.json({ success: true, data: users, pagination });
});

// @desc   Get single user
// @route  GET /api/users/:id
// @access Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({ success: true, data: user });
});

// @desc   Update user (Admin)
// @route  PUT /api/users/:id
// @access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const updated = await userService.updateUser(req.params.id, req.body);
  res.json({ success: true, data: updated });
});

// @desc   Delete user
// @route  DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id);
  res.json({ success: true, message: result.message });
});

// @desc   Get admin dashboard stats
// @route  GET /api/users/dashboard
// @access Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await userService.getDashboardStats();
  res.json({ success: true, data });
});

module.exports = { getUsers, getUserById, updateUser, deleteUser, getDashboardStats };
