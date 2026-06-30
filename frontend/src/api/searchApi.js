import api from './axiosClient';

export const searchService = {
  search: (params) => api.get('/search', { params }),
  suggestions: (q) => api.get('/search/suggestions', { params: { q } }),
};
