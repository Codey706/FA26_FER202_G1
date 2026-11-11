import api from './api';

/**
 * Service cho module Đăng nhập & Xác thực (Authentication)
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
  },

  /**
   * Đăng ký tài khoản khách hàng mới
   * @param {object} userData - { username, fullName, email, phone, password, address }
   * @returns {Promise<object>} thông tin user mới tạo (không chứa password)
   */
  register: async ({ username, fullName, email, phone, password, address = '' }) => {
    const cleanUsername = String(username || '').trim();
    const cleanFullName = String(fullName || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();
    const cleanAddress = String(address || '').trim();

    if (!cleanUsername || !cleanFullName || !cleanEmail || !cleanPhone || !password) {
      throw new Error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
    }

    if (cleanUsername.length < 3) {
      throw new Error('Tên đăng nhập phải có ít nhất 3 ký tự.');
    }

    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      throw new Error('Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới, gạch ngang hoặc dấu chấm.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Địa chỉ email không đúng định dạng.');
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(cleanPhone)) {
      throw new Error('Số điện thoại không hợp lệ (cần 10 chữ số, ví dụ 0987654321).');
    }

    if (String(password).length < 6) {
      throw new Error('Mật khẩu phải có tối thiểu 6 ký tự.');
    }

    // Kiểm tra trùng username
    const existingUsers = await api.get('/users');
    if (Array.isArray(existingUsers)) {
      const isUsernameTaken = existingUsers.some(
        (u) => String(u.username || '').toLowerCase() === cleanUsername.toLowerCase()
      );
      if (isUsernameTaken) {
        throw new Error('Tên đăng nhập này đã tồn tại. Vui lòng chọn tên đăng nhập khác.');
      }

      const isEmailTaken = existingUsers.some(
        (u) => String(u.email || '').toLowerCase() === cleanEmail
      );
      if (isEmailTaken) {
        throw new Error('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc Đăng nhập.');
      }
    }

    // Tạo user mới
    const newUser = {
      id: `u${Date.now()}`,
      username: cleanUsername,
      fullName: cleanFullName,
      email: cleanEmail,
      password: String(password),
      phone: cleanPhone,
      address: cleanAddress,
      role: 'customer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    };

    const created = await api.post('/users', newUser);
    return stripPassword(created);
  },

  /**
   * Tìm người dùng phục vụ cho Quên mật khẩu
   * @param {string} identifier - email hoặc tên đăng nhập
   * @returns {Promise<object>}
   */
  findUserForReset: async (identifier) => {
    const value = String(identifier || '').trim();
    if (!value) {
      throw new Error('Vui lòng nhập email hoặc tên đăng nhập của bạn.');
    }

    const allUsers = await api.get('/users');
    if (!Array.isArray(allUsers) || allUsers.length === 0) {
      throw new Error('Không thể kết nối đến cơ sở dữ liệu người dùng.');
    }

    const foundUser = allUsers.find(
      (u) =>
        String(u.username || '').toLowerCase() === value.toLowerCase() ||
        String(u.email || '').toLowerCase() === value.toLowerCase()
    );

    if (!foundUser) {
      throw new Error('Không tìm thấy tài khoản nào khớp với thông tin bạn cung cấp.');
    }

    if (foundUser.status !== 'active') {
      throw new Error('Tài khoản này đang bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.');
    }

    // Trả về thông tin an toàn (ẩn một phần email để bảo mật)
    const [namePart, domainPart] = (foundUser.email || '').split('@');
    const maskedEmail = namePart
      ? `${namePart.slice(0, 2)}***@${domainPart || 'petshop.vn'}`
      : '***@petshop.vn';

    return {
      id: foundUser.id,
      fullName: foundUser.fullName,
      maskedEmail,
      username: foundUser.username
    };
  },

  /**
   * Đặt lại mật khẩu mới cho tài khoản (Quên mật khẩu)
   * @param {string|number} userId
   * @param {string} newPassword
   */
  resetPassword: async (userId, newPassword) => {
    if (!newPassword || String(newPassword).length < 6) {
      throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
    }

    await api.patch(`/users/${userId}`, { password: String(newPassword) });
    return true;
  }
};

export default authService;
