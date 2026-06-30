import api from './axiosClient';

export const wishlistService = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  toggle: (productId) => api.post(`/wishlist/${productId}/toggle`),
  clear: () => api.delete('/wishlist'),
};
