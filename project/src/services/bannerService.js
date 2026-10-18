import api from './api';

/**
 * Service for Hero Banners
 */
export const bannerService = {
  getBanners: async (params = {}) => {
    return await api.get('/banners', params);
  },

  getBannerById: async (id) => {
    return await api.get(`/banners/${id}`);
  }
};

export default bannerService;
