const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const AppError = require('../utils/AppError');

const registerUser = async (data) => {
  const { name, email, password } = data;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError('User already exists with this email', 400);
  }

  const user = await User.create({ name, email, password });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user._id),
  };
};

const loginUser = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated. Contact support.', 401);
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user._id),
  };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const updateUserProfile = async (userId, data) => {
  const { name, phone, avatar } = data;
  const user = await User.findByIdAndUpdate(
    userId,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const changeUserPassword = async (userId, data) => {
  const { currentPassword, newPassword } = data;
  const user = await User.findById(userId).select('+password');

  if (!user) throw new AppError('User not found', 404);

  if (!(await user.matchPassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully' };
};

const handleGoogleCallback = (user) => {
  return generateToken(user._id);
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  handleGoogleCallback
};
