import api from './axiosClient';

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  deleteImage: (id, index) => api.delete(`/products/${id}/images/${index}`),
  getStats: () => api.get('/admin/products/stats'),
  getLowStock: (threshold) => api.get('/admin/products/low-stock', { params: { threshold } }),
  exportCSV: (params) => api.get('/admin/products/export', { params, responseType: 'blob' }),
  bulkUpdate: (ids, updates) => api.put('/admin/products/bulk', { ids, updates }),
  bulkDelete: (ids) => api.delete('/admin/products/bulk', { data: { ids } }),
};
