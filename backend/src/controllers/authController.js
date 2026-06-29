const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    },
  });
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Account is deactivated. Contact support.');
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    },
  });
});

// @desc   Get current user
// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

// @desc   Update profile
// @route  PUT /api/auth/me
// @access Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: user });
});

// @desc   Change password
// @route  PUT /api/auth/change-password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { register, login, getMe, updateMe, changePassword };

// @desc   Google OAuth — verify access token, find/create user, return JWT
// @route  POST /api/auth/google
// @access Public
const googleLogin = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    res.status(400);
    throw new Error('Google access token is required');
  }

  // Verify token with Google's userinfo endpoint
  let googleUser;
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error('Invalid token');
    googleUser = await response.json();
  } catch {
    res.status(401);
    throw new Error('Google authentication failed — invalid token');
  }

  const { sub: googleId, email, name, picture } = googleUser;

  if (!email) {
    res.status(400);
    throw new Error('Google account must have an email address');
  }

  // Find user by email or googleId; link if found, create if new
  let user = await User.findOne({ $or: [{ email }, { googleId }] });

  if (user) {
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is deactivated. Contact support.');
    }
    // Link Google ID if not already linked
    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = 'google';
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }
  } else {
    // Create new user (no password for Google accounts)
    user = await User.create({
      name,
      email,
      googleId,
      avatar: picture || '',
      authProvider: 'google',
    });
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    },
  });
});

module.exports = Object.assign(module.exports, { googleLogin });
