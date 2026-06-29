/**
 * Admin-only consolidated routes under /api/admin/
 * All routes require authentication + admin role.
 */
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Controllers
const {
  getProductStats, getLowStockProducts,
  bulkUpdateProducts, bulkDeleteProducts, exportProductsCSV,
} = require('../controllers/productController');

const { updateOrderTracking, processRefund, getSalesAnalytics } = require('../controllers/orderController');

const { reorderCategories, getCategoryTree } = require('../controllers/categoryController');

const {
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
} = require('../controllers/couponController');

const {
  getSettings, updateSettings,
  getBanners, addBanner, updateBanner, deleteBanner,
  getShippingRules, updateShippingRules,
} = require('../controllers/settingsController');

// Apply auth middleware to all admin routes
router.use(protect, admin);

// ===== PRODUCT admin routes =====
router.get('/products/stats', getProductStats);
router.get('/products/low-stock', getLowStockProducts);
router.get('/products/export', exportProductsCSV);
router.put('/products/bulk', bulkUpdateProducts);
router.delete('/products/bulk', bulkDeleteProducts);

// ===== ORDER admin routes =====
router.get('/orders/analytics', getSalesAnalytics);
router.put('/orders/:id/tracking', updateOrderTracking);
router.put('/orders/:id/refund', processRefund);

// ===== CATEGORY admin routes =====
router.put('/categories/reorder', reorderCategories);
router.get('/categories/tree', getCategoryTree);

// ===== COUPON admin routes =====
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// ===== SETTINGS admin routes =====
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/settings/banners', getBanners);
router.post('/settings/banners', upload.single('image'), addBanner);
router.put('/settings/banners/:bannerId', upload.single('image'), updateBanner);
router.delete('/settings/banners/:bannerId', deleteBanner);
router.get('/settings/shipping', getShippingRules);
router.put('/settings/shipping', updateShippingRules);

module.exports = router;
