const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    data,
  });
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);
  res.json({
    success: true,
    data,
  });
});

// @desc   Get current user
// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const data = await authService.getUserProfile(req.user._id);
  res.json({ success: true, data });
});

// @desc   Update profile
// @route  PUT /api/auth/me
// @access Private
const updateMe = asyncHandler(async (req, res) => {
  const data = await authService.updateUserProfile(req.user._id, req.body);
  res.json({ success: true, data });
});

// @desc   Change password
// @route  PUT /api/auth/change-password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const data = await authService.changeUserPassword(req.user._id, req.body);
  res.json({ success: true, message: data.message });
});

// @desc   Google OAuth Callback — return JWT and redirect to frontend
// @route  GET /api/auth/google/callback
// @access Public
const googleCallback = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.redirect('http://localhost:5173/login?error=GoogleAuthFailed');
  }

  const token = authService.handleGoogleCallback(req.user);
  res.redirect(`http://localhost:5173/oauth/callback?token=${token}`);
});

module.exports = { register, login, getMe, updateMe, changePassword, googleCallback };
