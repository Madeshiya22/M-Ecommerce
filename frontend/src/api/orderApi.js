import api from './axiosClient';

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/myorders'),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get('/orders', { params }),
  getStats: () => api.get('/orders/stats'),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  updateTracking: (id, data) => api.put(`/admin/orders/${id}/tracking`, data),
  processRefund: (id, data) => api.put(`/admin/orders/${id}/refund`, data),
  getAnalytics: (params) => api.get('/admin/orders/analytics', { params }),
};
