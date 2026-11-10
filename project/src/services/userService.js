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
   * Cập nhật thông tin hồ sơ người dùng (người dùng tự cập nhật)
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
  },

  // ==========================================
  // DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN)
  // ==========================================

  /**
   * Lấy toàn bộ danh sách người dùng cho trang Admin
   */
  getAllUsers: async () => {
    const users = await api.get('/users');
    if (!Array.isArray(users)) return [];
    return users.map(stripPassword);
  },

  /**
   * Tạo người dùng mới từ phía Quản trị viên
   * @param {object} userData
   */
  createUser: async (userData) => {
    const { username, fullName, email, phone, password, role = 'customer', status = 'active', address = '', avatar } = userData;

    const cleanUsername = String(username || '').trim();
    const cleanFullName = String(fullName || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();

    if (!cleanUsername || !cleanFullName || !cleanEmail || !password) {
      throw new Error('Vui lòng điền các thông tin bắt buộc: Tên đăng nhập, Họ tên, Email, Mật khẩu.');
    }

    if (String(password).length < 6) {
      throw new Error('Mật khẩu khởi tạo phải từ 6 ký tự trở lên.');
    }

    // Kiểm tra trùng username hoặc email
    const allUsers = await api.get('/users');
    if (Array.isArray(allUsers)) {
      if (allUsers.some((u) => String(u.username || '').toLowerCase() === cleanUsername.toLowerCase())) {
        throw new Error('Tên đăng nhập này đã được sử dụng.');
      }
      if (allUsers.some((u) => String(u.email || '').toLowerCase() === cleanEmail)) {
        throw new Error('Email này đã được sử dụng bởi một tài khoản khác.');
      }
    }

    const newUser = {
      id: `u${Date.now()}`,
      username: cleanUsername,
      fullName: cleanFullName,
      email: cleanEmail,
      password: String(password),
      phone: cleanPhone,
      address: String(address || '').trim(),
      role: role || 'customer',
      status: status || 'active',
      avatar: avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    };

    const created = await api.post('/users', newUser);
    return stripPassword(created);
  },

  /**
   * Cập nhật thông tin người dùng từ phía Admin (được phép sửa role, status, email...)
   * @param {string|number} id
   * @param {object} updateData
   */
  updateUserAdmin: async (id, updateData) => {
    const allUsers = await api.get('/users');
    if (Array.isArray(allUsers)) {
      if (updateData.email) {
        const cleanEmail = String(updateData.email).trim().toLowerCase();
        if (allUsers.some((u) => String(u.id) !== String(id) && String(u.email || '').toLowerCase() === cleanEmail)) {
          throw new Error('Email này đã được sử dụng bởi một tài khoản khác.');
        }
      }
      if (updateData.username) {
        const cleanUsername = String(updateData.username).trim().toLowerCase();
        if (allUsers.some((u) => String(u.id) !== String(id) && String(u.username || '').toLowerCase() === cleanUsername)) {
          throw new Error('Tên đăng nhập này đã tồn tại.');
        }
      }
    }

    const payload = { ...updateData };
    delete payload.password; // Không cập nhật mật khẩu qua hàm này

    const updated = await api.patch(`/users/${id}`, payload);
    return stripPassword(updated);
  },

  /**
   * Khóa / Kích hoạt nhanh trạng thái tài khoản
   * @param {string|number} id
   * @param {string} currentStatus - 'active' hoặc 'inactive'
   */
  toggleUserStatus: async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const updated = await api.patch(`/users/${id}`, { status: newStatus });
    return stripPassword(updated);
  },

  /**
   * Admin đặt lại mật khẩu cho một người dùng bất kỳ
   * @param {string|number} id
   * @param {string} newPassword
   */
  adminResetPassword: async (id, newPassword) => {
    if (!newPassword || String(newPassword).length < 6) {
      throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
    }

    await api.patch(`/users/${id}`, { password: String(newPassword) });
    return true;
  },

  /**
   * Xóa tài khoản người dùng
   * @param {string|number} id
   */
  deleteUser: async (id) => {
    await api.delete(`/users/${id}`);
    return true;
  }
};

export default userService;
