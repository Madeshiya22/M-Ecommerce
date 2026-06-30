import api from './axiosClient';

export const couponService = {
  getByCode: (code) => api.get(`/coupons/${code}`),
  apply: (code, orderTotal) => api.post('/coupons/apply', { code, orderTotal }),
  getAll: (params) => api.get('/admin/coupons', { params }),
  create: (data) => api.post('/admin/coupons', data),
  update: (id, data) => api.put(`/admin/coupons/${id}`, data),
  delete: (id) => api.delete(`/admin/coupons/${id}`),
};
