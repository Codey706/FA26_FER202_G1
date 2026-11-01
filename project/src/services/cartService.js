import api from './api';

/**
 * CRUD cho collection `carts` của JSON Server.
 * Create: createCart | Read: getCart/getCarts | Update: updateCart | Delete: deleteCart
 */
export const cartService = {
  getCarts: (params = {}) => api.get('/carts', params),
  getCart: (id) => api.get(`/carts/${id}`),
  createCart: (cartData) => api.post('/carts', cartData),
  updateCart: (id, cartData) => api.put(`/carts/${id}`, cartData),
  deleteCart: (id) => api.delete(`/carts/${id}`),
};

export default cartService;
