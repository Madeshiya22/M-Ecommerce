import api from './axiosClient';

export const settingsService = {
  getPublic: () => api.get('/settings'),
  get: () => api.get('/admin/settings'),
  update: (data) => api.put('/admin/settings', data),
  getBanners: () => api.get('/admin/settings/banners'),
  addBanner: (data) => api.post('/admin/settings/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBanner: (id, data) => api.put(`/admin/settings/banners/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBanner: (id) => api.delete(`/admin/settings/banners/${id}`),
  getShipping: () => api.get('/admin/settings/shipping'),
  updateShipping: (shippingRules) => api.put('/admin/settings/shipping', { shippingRules }),
};
