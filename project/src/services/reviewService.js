import api from './api';

/**
 * Service for Reviews & Testimonials module
 */
export const reviewService = {
  getReviews: async (params = {}) => {
    return await api.get('/reviews', params);
  },

  getReviewById: async (id) => {
    return await api.get(`/reviews/${id}`);
  },

  createReview: async (reviewData) => {
    return await api.post('/reviews', reviewData);
  }
};

export default reviewService;
