import api from './api';

const orderService = {
  getAll: () => api.get('/orders'),

  getById: (id) => api.get(`/orders/${id}`),

  create: (orderData) => api.post('/orders', orderData),

  updateStatus: (id, orderStatus) =>
    api.patch(`/orders/${id}`, { orderStatus }),

  delete: (id) => api.delete(`/orders/${id}`),
};

export default orderService;
