import api from './api';

/**
 * Service cho module Đăng nhập (Authentication)
 *
 * LƯU Ý: Đây là hệ thống MOCK dùng JSON Server nên mật khẩu được lưu dạng
 * plain-text trong db.json và so khớp ở phía client. KHÔNG dùng cách này
 * cho hệ thống thật – khi có backend, hãy thay hàm login bằng POST /auth/login.
 */

// Loại bỏ mật khẩu trước khi lưu thông tin user ở client
const stripPassword = ({ password, ...safeUser }) => safeUser;

export const authService = {
  /**
   * Đăng nhập bằng tên đăng nhập HOẶC email + mật khẩu
   * @returns {Promise<object>} thông tin user (không chứa password)
   */
  login: async (identifier, password) => {
    const value = String(identifier || '').trim();

    if (!value || !password) {
      throw new Error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
    }

    // Tìm theo username trước, nếu không có thì tìm theo email
    let matches = await api.get('/users', { username: value });
    if (!Array.isArray(matches) || matches.length === 0) {
      matches = await api.get('/users', { email: value.toLowerCase() });
    }

    const user = Array.isArray(matches)
      ? matches.find((item) => item.password === password)
      : null;

    // Dùng chung một thông báo để không lộ tài khoản nào tồn tại
    if (!user) {
      throw new Error('Tên đăng nhập / email hoặc mật khẩu không đúng.');
    }

    if (user.status !== 'active') {
      throw new Error(
        'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ hotline 0987.654.321 để được hỗ trợ.'
      );
    }

    return stripPassword(user);
  }
};

export default authService;
