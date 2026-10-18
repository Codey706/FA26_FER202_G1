import api from './api';

/**
 * Service for Breeds module
 */
export const breedService = {
  getBreeds: async (params = {}) => {
    return await api.get('/breeds', params);
  },

  getBreedById: async (id) => {
    return await api.get(`/breeds/${id}`);
  },

  createBreed: async (breedData) => {
    return await api.post('/breeds', breedData);
  },

  updateBreed: async (id, breedData) => {
    return await api.put(`/breeds/${id}`, breedData);
  },

  deleteBreed: async (id) => {
    return await api.delete(`/breeds/${id}`);
  }
};

export default breedService;
