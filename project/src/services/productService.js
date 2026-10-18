import api from './api';

/**
 * Service for Product module (Pets & Accessories)
 */
export const productService = {
  /**
   * Get all products with optional query parameters
   * @param {object} params
   */
  getProducts: async (params = {}) => {
    return await api.get('/products', params);
  },

  /**
   * Get featured pets with optional type filter ('dog', 'cat', 'all')
   * @param {string} petType - 'all' | 'dog' | 'cat'
   */
  getFeaturedPets: async (petType = 'all') => {
    const params = { isFeatured: true };
    if (petType && petType !== 'all') {
      params.petType = petType;
    }
    const products = await api.get('/products', params);
    // Ensure we only return pets (not accessories) for the pet section
    return products.filter((p) => p.petType === 'dog' || p.petType === 'cat');
  },

  /**
   * Get all pets (dogs and cats) with optional filters
   * @param {object} params
   */
  getPets: async (params = {}) => {
    const products = await api.get('/products', params);
    return products.filter((p) => p.petType === 'dog' || p.petType === 'cat');
  },

  /**
   * Get pet accessories and foods
   * @param {object} params
   */
  getAccessories: async (params = {}) => {
    const defaultParams = { petType: 'accessory', ...params };
    return await api.get('/products', defaultParams);
  },

  /**
   * Get product details by ID
   * @param {string} id
   */
  getProductById: async (id) => {
    return await api.get(`/products/${id}`);
  },

  // Prepared for future CRUD module
  createProduct: async (productData) => {
    return await api.post('/products', productData);
  },

  updateProduct: async (id, productData) => {
    return await api.put(`/products/${id}`, productData);
  },

  deleteProduct: async (id) => {
    return await api.delete(`/products/${id}`);
  }
};

export default productService;
