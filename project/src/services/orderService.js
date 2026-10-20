
import api from './api';

const orderService = {
  getAll: () => api.get('/orders'),

  getById: (id) => api.get(`/orders/${id}`),

  updateStatus: (id, orderStatus) =>
    api.patch(`/orders/${id}`, { orderStatus }),
};

export default orderService;
