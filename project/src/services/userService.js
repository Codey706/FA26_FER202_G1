import api from './api';

// Loại bỏ mật khẩu trước khi lưu hoặc trả về ở client
const stripPassword = ({ password, ...safeUser }) => safeUser;

export const userService = {
  /**
   * Lấy thông tin chi tiết của người dùng theo ID
   * @param {string|number} id
   */
  getById: async (id) => {
    const user = await api.get(`/users/${id}`);
    return user ? stripPassword(user) : null;
  },

  /**
   * Lấy thông tin đầy đủ gồm mật khẩu để kiểm tra (dùng nội bộ xác thực)
   * @param {string|number} id
   */
  getUserWithCredentials: async (id) => {
    return await api.get(`/users/${id}`);
  },

  /**
   * Cập nhật thông tin hồ sơ người dùng
   * @param {string|number} id
   * @param {object} profileData - { fullName, email, phone, address, avatar }
   */
  updateProfile: async (id, profileData) => {
    // 1. Nếu thay đổi email, kiểm tra xem email đã được dùng bởi tài khoản khác chưa
    if (profileData.email) {
      const targetEmail = String(profileData.email).trim().toLowerCase();
      const existing = await api.get('/users', { email: targetEmail });
      if (Array.isArray(existing) && existing.some((u) => String(u.id) !== String(id))) {
        throw new Error('Email này đã được sử dụng bởi một tài khoản khác.');
      }
    }

    // 2. Cập nhật thông tin
    const payload = { ...profileData };
    delete payload.password; // Không cho phép đổi mật khẩu qua route này
    delete payload.role;     // Không cho phép tự đổi vai trò
    delete payload.username; // Không cho phép đổi username

    const updated = await api.patch(`/users/${id}`, payload);
    return stripPassword(updated);
  },

  /**
   * Đổi mật khẩu tài khoản
   * @param {string|number} id
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  changePassword: async (id, currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
      throw new Error('Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới.');
    }

    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
    }

    if (currentPassword === newPassword) {
      throw new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
    }

    // Lấy thông tin user để kiểm tra mật khẩu hiện tại
    const user = await api.get(`/users/${id}`);
    if (!user) {
      throw new Error('Không tìm thấy tài khoản người dùng.');
    }

    if (user.password !== currentPassword) {
      throw new Error('Mật khẩu hiện tại không chính xác.');
    }

    // Cập nhật mật khẩu mới
    await api.patch(`/users/${id}`, { password: newPassword });
    return true;
  },

  /**
   * Lấy danh sách các đơn hàng của người dùng
   * @param {object} user - Thông tin người dùng hiện tại
   */
  getUserOrders: async (user) => {
    if (!user) return [];
    
    const allOrders = await api.get('/orders');
    if (!Array.isArray(allOrders)) return [];

    const userEmail = String(user.email || '').toLowerCase().trim();
    const userPhone = String(user.phone || '').trim();
    const userId = String(user.id || '').trim();

    return allOrders.filter((order) => {
      // Khớp theo userId
      if (order.userId && String(order.userId) === userId) return true;
      
      // Hoặc khớp theo email
      if (userEmail && String(order.email || '').toLowerCase().trim() === userEmail) {
        return true;
      }

      // Hoặc khớp theo phone
      if (userPhone && String(order.phone || '').trim() === userPhone) {
        return true;
      }

      return false;
    });
  }
};

export default userService;
