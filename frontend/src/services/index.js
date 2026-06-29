import api from './api';

// Auth
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (accessToken) => api.post('/auth/google', { accessToken }),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Products
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  deleteImage: (id, index) => api.delete(`/products/${id}/images/${index}`),
  // Admin-only
  getStats: () => api.get('/admin/products/stats'),
  getLowStock: (threshold) => api.get('/admin/products/low-stock', { params: { threshold } }),
  exportCSV: (params) => api.get('/admin/products/export', { params, responseType: 'blob' }),
  bulkUpdate: (ids, updates) => api.put('/admin/products/bulk', { ids, updates }),
  bulkDelete: (ids) => api.delete('/admin/products/bulk', { data: { ids } }),
};

// Categories
export const categoryService = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  getTree: (params) => api.get('/categories/tree', { params }),
  create: (data) => api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/categories/${id}`),
  reorder: (orders) => api.put('/admin/categories/reorder', { orders }),
};

// Orders
export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/myorders'),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get('/orders', { params }),
  getStats: () => api.get('/orders/stats'),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  // Admin-only
  updateTracking: (id, data) => api.put(`/admin/orders/${id}/tracking`, data),
  processRefund: (id, data) => api.put(`/admin/orders/${id}/refund`, data),
  getAnalytics: (params) => api.get('/admin/orders/analytics', { params }),
};

// Users
export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getDashboard: () => api.get('/users/dashboard'),
};

// Wishlist
export const wishlistService = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  toggle: (productId) => api.post(`/wishlist/${productId}/toggle`),
  clear: () => api.delete('/wishlist'),
};

// Coupons
export const couponService = {
  getByCode: (code) => api.get(`/coupons/${code}`),
  apply: (code, orderTotal) => api.post('/coupons/apply', { code, orderTotal }),
  // Admin-only
  getAll: (params) => api.get('/admin/coupons', { params }),
  create: (data) => api.post('/admin/coupons', data),
  update: (id, data) => api.put(`/admin/coupons/${id}`, data),
  delete: (id) => api.delete(`/admin/coupons/${id}`),
};

// Settings
export const settingsService = {
  getPublic: () => api.get('/settings'),
  // Admin-only
  get: () => api.get('/admin/settings'),
  update: (data) => api.put('/admin/settings', data),
  getBanners: () => api.get('/admin/settings/banners'),
  addBanner: (data) => api.post('/admin/settings/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBanner: (id, data) => api.put(`/admin/settings/banners/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBanner: (id) => api.delete(`/admin/settings/banners/${id}`),
  getShipping: () => api.get('/admin/settings/shipping'),
  updateShipping: (shippingRules) => api.put('/admin/settings/shipping', { shippingRules }),
};

// Search
export const searchService = {
  search: (params) => api.get('/search', { params }),
  suggestions: (q) => api.get('/search/suggestions', { params: { q } }),
};

