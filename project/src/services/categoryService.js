import api from './api';

/**
 * Service for Category module
 */
export const categoryService = {
  getCategories: async (params = {}) => {
    return await api.get('/categories', params);
  },

  getCategoryById: async (id) => {
    return await api.get(`/categories/${id}`);
  },

  // Prepared for future CRUD module
  createCategory: async (categoryData) => {
    return await api.post('/categories', categoryData);
  },

  updateCategory: async (id, categoryData) => {
    return await api.put(`/categories/${id}`, categoryData);
  },

  deleteCategory: async (id) => {
    return await api.delete(`/categories/${id}`);
  }
};

export default categoryService;
