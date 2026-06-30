const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Routes â€” existing
const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const userRoutes = require('./src/routes/userRoutes');

// Routes â€” new
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const couponRoutes = require('./src/routes/couponRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// Passport config
require('./src/config/passport');

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000', 'https://m-ecommerce-plum.vercel.app'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== Public / User API Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/search', searchRoutes);

// ===== Admin-only API Routes =====
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', message: 'THREAD E-Commerce API is running ðŸš€' })
);

// Error middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;

