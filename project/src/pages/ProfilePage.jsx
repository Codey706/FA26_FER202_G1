import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  InputGroup,
  Modal,
  Spinner,
  Badge
} from 'react-bootstrap';
import {
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCamera,
  FaShoppingBag,
  FaShieldAlt,
  FaSignOutAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaCalendarAlt,
  FaArrowRight,
  FaPaw,
  FaIdCard
} from 'react-icons/fa';

import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import '../styles/ProfilePage.css';

// Nhãn vai trò tiếng Việt
const ROLE_LABELS = {
  admin: 'Quản trị viên',
  staff: 'Nhân viên cửa hàng',
  customer: 'Khách hàng thân thiết'
};

// Nhãn trạng thái đơn hàng
const ORDER_STATUS_LABELS = {
  pending: { text: 'Chờ xác nhận', bg: 'warning', color: '#854d0e' },
  processing: { text: 'Đang xử lý', bg: 'info', color: '#0369a1' },
  shipping: { text: 'Đang giao hàng', bg: 'primary', color: '#1d4ed8' },
  delivered: { text: 'Giao thành công', bg: 'success', color: '#15803d' },
  cancelled: { text: 'Đã hủy', bg: 'danger', color: '#b91c1c' }
};

// Danh sách các avatar mẫu thú cưng dễ thương cho Pet Shop
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80', // Cún Corgi
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80', // Mèo vàng
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&q=80', // Cún Poodle
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=200&q=80', // Mèo British
  'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=200&q=80', // Cún Beagle
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(val) || 0);

const formatDate = (isoString) => {
  if (!isoString) return 'Chưa cập nhật';
  try {
    return new Date(isoString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
};

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'info' | 'password' | 'orders' | 'security'
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam && ['info', 'password', 'orders', 'security'].includes(tabParam) ? tabParam : 'info';
  });
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['info', 'password', 'orders', 'security'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Form State cho Thông tin cá nhân
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });

  // Form State cho Đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Danh sách đơn hàng của người dùng
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Modal Avatar
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');

  // Trạng thái chung
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Đồng bộ form khi `user` thay đổi
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || ''
      });
      setTempAvatarUrl(user.avatar || '');
    }
  }, [user]);

  // Tải đơn hàng khi chuyển sang tab orders
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      const fetchOrders = async () => {
        try {
          setLoadingOrders(true);
          const data = await userService.getUserOrders(user);
          setOrders(data);
        } catch (err) {
          console.error('Không thể tải đơn hàng của người dùng:', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, user]);

  // Tự ẩn thông báo feedback sau 5 giây
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handle thay đổi form thông tin
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  // Lưu thông tin cá nhân
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    // Validate
    if (!profileForm.fullName.trim()) {
      setFeedback({ type: 'danger', message: 'Họ và tên không được để trống.' });
      return;
    }

    if (!profileForm.email.trim()) {
      setFeedback({ type: 'danger', message: 'Email không được để trống.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email.trim())) {
      setFeedback({ type: 'danger', message: 'Địa chỉ email không đúng định dạng.' });
      return;
    }

    if (profileForm.phone) {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(profileForm.phone.trim())) {
        setFeedback({
          type: 'danger',
          message: 'Số điện thoại không hợp lệ (cần 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).'
        });
        return;
      }
    }

    try {
      setSavingProfile(true);
      const updatedUser = await userService.updateProfile(user.id, {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
        avatar: profileForm.avatar
      });

      updateUser(updatedUser);
      setFeedback({
        type: 'success',
        message: 'Cập nhật thông tin hồ sơ cá nhân thành công!'
      });
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.message || 'Cập nhật thất bại. Vui lòng thử lại!'
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle thay đổi form đổi mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // Đổi mật khẩu
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      setFeedback({ type: 'danger', message: 'Vui lòng nhập mật khẩu hiện tại.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setFeedback({ type: 'danger', message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'danger', message: 'Xác nhận mật khẩu mới không trùng khớp.' });
      return;
    }

    if (currentPassword === newPassword) {
      setFeedback({
        type: 'danger',
        message: 'Mật khẩu mới không được giống với mật khẩu hiện tại.'
      });
      return;
    }

    try {
      setChangingPassword(true);
      await userService.changePassword(user.id, currentPassword, newPassword);

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setFeedback({
        type: 'success',
        message: 'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.'
      });
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại!'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Áp dụng ảnh đại diện mới từ modal
  const handleApplyAvatar = async () => {
    if (!tempAvatarUrl) return;

    try {
      setSavingProfile(true);
      const updatedUser = await userService.updateProfile(user.id, {
        avatar: tempAvatarUrl
      });
      updateUser(updatedUser);
      setProfileForm((prev) => ({ ...prev, avatar: tempAvatarUrl }));
      setShowAvatarModal(false);
      setFeedback({
        type: 'success',
        message: 'Cập nhật ảnh đại diện thành công!'
      });
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.message || 'Không thể cập nhật ảnh đại diện.'
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Upload file từ máy và chuyển sang Base64
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (jpg, png, webp, ...)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Dung lượng ảnh nên nhỏ hơn 2MB để hệ thống xử lý nhanh.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Xử lý đăng xuất an toàn
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?')) {
      logout();
      navigate('/');
    }
  };

  if (!user) return null;

  const roleClass =
    user.role === 'admin'
      ? 'profile-role-admin'
      : user.role === 'staff'
      ? 'profile-role-staff'
      : 'profile-role-customer';

  return (
    <main className="profile-page">
      <Container>
        {/* Breadcrumb Navigation */}
        <div className="profile-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="profile-breadcrumb-separator">/</span>
          <span className="text-dark fw-bold">Hồ sơ cá nhân</span>
        </div>

        {/* Global Feedback Alert */}
        {feedback.message && (
          <Alert
            variant={feedback.type}
            dismissible
            onClose={() => setFeedback({ type: '', message: '' })}
            className="d-flex align-items-center gap-2 shadow-sm rounded-4 mb-4"
          >
            {feedback.type === 'success' ? (
              <FaCheckCircle className="fs-5 flex-shrink-0" />
            ) : (
              <FaExclamationCircle className="fs-5 flex-shrink-0" />
            )}
            <div>{feedback.message}</div>
          </Alert>
        )}

        <Row className="g-4">
          {/* CỘT TRÁI: User Sidebar */}
          <Col lg={4}>
            <div className="profile-sidebar-card">
              <div className="profile-sidebar-banner" />

              <div className="profile-sidebar-content">
                {/* Avatar with edit button */}
                <div className="profile-avatar-container">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="profile-avatar-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = PRESET_AVATARS[0];
                      }}
                    />
                  ) : (
                    <div className="profile-avatar-fallback">
                      <FaUserAlt />
                    </div>
                  )}

                  <button
                    type="button"
                    className="profile-avatar-edit-btn"
                    onClick={() => {
                      setTempAvatarUrl(user.avatar || '');
                      setShowAvatarModal(true);
                    }}
                    title="Đổi ảnh đại diện"
                  >
                    <FaCamera size={14} />
                  </button>
                </div>

                {/* User Info Overview */}
                <h2 className="profile-user-name">{user.fullName}</h2>
                <div className="profile-user-email">{user.email}</div>

                <div className="mb-2">
                  <span className={`profile-role-tag ${roleClass}`}>
                    <FaShieldAlt /> {ROLE_LABELS[user.role] || user.role}
                  </span>
                </div>

                <small className="text-muted d-block mt-2">
                  <FaCalendarAlt className="me-1" />
                  Gia nhập: {formatDate(user.createdAt)}
                </small>

                {/* Sidebar Navigation Menu */}
                <div className="profile-menu-nav">
                  <button
                    type="button"
                    className={`profile-menu-item ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                  >
                    <span className="menu-icon">
                      <FaUserAlt />
                    </span>
                    <span>Thông tin cá nhân</span>
                  </button>

                  <button
                    type="button"
                    className={`profile-menu-item ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                  >
                    <span className="menu-icon">
                      <FaLock />
                    </span>
                    <span>Đổi mật khẩu</span>
                  </button>

                  <button
                    type="button"
                    className={`profile-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <span className="menu-icon">
                      <FaShoppingBag />
                    </span>
                    <span>Đơn hàng của tôi</span>
                    {orders.length > 0 && (
                      <span className="profile-menu-badge">{orders.length}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`profile-menu-item ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <span className="menu-icon">
                      <FaShieldAlt />
                    </span>
                    <span>Tài khoản & Quyền hạn</span>
                  </button>

                  <button
                    type="button"
                    className="profile-menu-item text-danger mt-2"
                    onClick={handleLogout}
                  >
                    <span className="menu-icon">
                      <FaSignOutAlt />
                    </span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          </Col>

          {/* CỘT PHẢI: Tab Content */}
          <Col lg={8}>
            <div className="profile-main-card">
              {/* TAB 1: THÔNG TIN CÁ NHÂN */}
              {activeTab === 'info' && (
                <div>
                  <div className="profile-card-header">
                    <div>
                      <h3 className="profile-card-title">
                        <FaUserAlt className="title-icon" /> Thông tin cá nhân
                      </h3>
                      <p className="profile-card-subtitle">
                        Quản lý và cập nhật thông tin tài khoản mua sắm của bạn.
                      </p>
                    </div>

                    <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill fw-bold">
                      <FaPaw className="me-1" /> PET SHOP ID: {user.id}
                    </span>
                  </div>

                  <Form onSubmit={handleProfileSubmit}>
                    <Row className="g-3">
                      {/* Tên đăng nhập (Read-only) */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary">
                            Tên đăng nhập
                          </Form.Label>
                          <InputGroup className="profile-input-group">
                            <InputGroup.Text>
                              <FaIdCard />
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              value={user.username || ''}
                              disabled
                              readOnly
                            />
                          </InputGroup>
                          <Form.Text className="text-muted">
                            Tên đăng nhập không thể thay đổi sau khi tạo.
                          </Form.Text>
                        </Form.Group>
                      </Col>

                      {/* Họ và tên */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary">
                            Họ và tên <span className="text-danger">*</span>
                          </Form.Label>
                          <InputGroup className="profile-input-group">
                            <InputGroup.Text>
                              <FaUserAlt />
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="fullName"
                              value={profileForm.fullName}
                              onChange={handleProfileChange}
                              placeholder="Nhập họ và tên đầy đủ..."
                              required
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>

                      {/* Email */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary">
                            Địa chỉ Email <span className="text-danger">*</span>
                          </Form.Label>
                          <InputGroup className="profile-input-group">
                            <InputGroup.Text>
                              <FaEnvelope />
                            </InputGroup.Text>
                            <Form.Control
                              type="email"
                              name="email"
                              value={profileForm.email}
                              onChange={handleProfileChange}
                              placeholder="example@petshop.vn"
                              required
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>

                      {/* Số điện thoại */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary">
                            Số điện thoại
                          </Form.Label>
                          <InputGroup className="profile-input-group">
                            <InputGroup.Text>
                              <FaPhoneAlt />
                            </InputGroup.Text>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={profileForm.phone}
                              onChange={handleProfileChange}
                              placeholder="0987654321"
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>

                      {/* Địa chỉ giao hàng mặc định */}
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary">
                            Địa chỉ nhận hàng mặc định
                          </Form.Label>
                          <InputGroup className="profile-input-group">
                            <InputGroup.Text>
                              <FaMapMarkerAlt />
                            </InputGroup.Text>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              name="address"
                              value={profileForm.address}
                              onChange={handleProfileChange}
                              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                            />
                          </InputGroup>
                          <Form.Text className="text-muted">
                            Địa chỉ này sẽ được tự động điền khi bạn tiến hành thanh toán đơn hàng.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Submit Buttons */}
                    <div className="d-flex align-items-center justify-content-end gap-3 mt-4 pt-3 border-top">
                      <Button
                        type="button"
                        variant="light"
                        className="px-4 py-2 rounded-pill fw-semibold text-secondary"
                        onClick={() => {
                          setProfileForm({
                            fullName: user.fullName || '',
                            email: user.email || '',
                            phone: user.phone || '',
                            address: user.address || '',
                            avatar: user.avatar || ''
                          });
                        }}
                      >
                        Hủy thay đổi
                      </Button>

                      <Button
                        type="submit"
                        className="btn-primary-orange px-4 py-2 rounded-pill"
                        disabled={savingProfile}
                      >
                        {savingProfile ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Đang lưu...
                          </>
                        ) : (
                          'Lưu thay đổi'
                        )}
                      </Button>
                    </div>
                  </Form>
                </div>
              )}

              {/* TAB 2: ĐỔI MẬT KHẨU */}
              {activeTab === 'password' && (
                <div>
                  <div className="profile-card-header">
                    <div>
                      <h3 className="profile-card-title">
                        <FaLock className="title-icon" /> Đổi mật khẩu
                      </h3>
                      <p className="profile-card-subtitle">
                        Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.
                      </p>
                    </div>
                  </div>

                  <Form onSubmit={handlePasswordSubmit} style={{ maxWidth: 540 }}>
                    {/* Mật khẩu hiện tại */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-secondary">
                        Mật khẩu hiện tại <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup className="profile-input-group">
                        <InputGroup.Text>
                          <FaLock />
                        </InputGroup.Text>
                        <Form.Control
                          type={showCurrentPw ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Nhập mật khẩu hiện tại..."
                          required
                        />
                        <button
                          type="button"
                          className="profile-toggle-pw"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          tabIndex={-1}
                          title={showCurrentPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showCurrentPw ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </InputGroup>
                    </Form.Group>

                    {/* Mật khẩu mới */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-secondary">
                        Mật khẩu mới <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup className="profile-input-group">
                        <InputGroup.Text>
                          <FaLock />
                        </InputGroup.Text>
                        <Form.Control
                          type={showNewPw ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Tối thiểu 6 ký tự..."
                          required
                        />
                        <button
                          type="button"
                          className="profile-toggle-pw"
                          onClick={() => setShowNewPw(!showNewPw)}
                          tabIndex={-1}
                          title={showNewPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showNewPw ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Mật khẩu nên chứa ít nhất 6 ký tự, kết hợp chữ và số.
                      </Form.Text>
                    </Form.Group>

                    {/* Xác nhận mật khẩu mới */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-secondary">
                        Xác nhận mật khẩu mới <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup className="profile-input-group">
                        <InputGroup.Text>
                          <FaLock />
                        </InputGroup.Text>
                        <Form.Control
                          type={showConfirmPw ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Nhập lại mật khẩu mới..."
                          required
                        />
                        <button
                          type="button"
                          className="profile-toggle-pw"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                          tabIndex={-1}
                          title={showConfirmPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showConfirmPw ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </InputGroup>
                    </Form.Group>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="btn-primary-orange px-4 py-2 rounded-pill"
                        disabled={changingPassword}
                      >
                        {changingPassword ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Đang xử lý...
                          </>
                        ) : (
                          'Cập nhật mật khẩu'
                        )}
                      </Button>
                    </div>
                  </Form>
                </div>
              )}

              {/* TAB 3: ĐƠN HÀNG CỦA TÔI */}
              {activeTab === 'orders' && (
                <div>
                  <div className="profile-card-header">
                    <div>
                      <h3 className="profile-card-title">
                        <FaShoppingBag className="title-icon" /> Đơn hàng của tôi
                      </h3>
                      <p className="profile-card-subtitle">
                        Theo dõi tiến độ vận chuyển và lịch sử mua sắm thú cưng & phụ kiện.
                      </p>
                    </div>

                    <Button
                      as={Link}
                      to="/orders"
                      variant="outline-warning"
                      className="rounded-pill fw-bold btn-sm px-3"
                    >
                      Xem trang quản lý đơn <FaArrowRight className="ms-1" size={12} />
                    </Button>
                  </div>

                  {loadingOrders ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="warning" />
                      <p className="mt-3 text-muted">Đang tải danh sách đơn hàng của bạn...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-5">
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: 80,
                          height: 80,
                          background: 'var(--primary-light)',
                          color: 'var(--primary-color)'
                        }}
                      >
                        <FaShoppingBag size={36} />
                      </div>
                      <h5 className="fw-bold">Bạn chưa có đơn hàng nào</h5>
                      <p className="text-muted mb-4" style={{ maxWidth: 400, margin: '0 auto' }}>
                        Khám phá các bé cún cưng, mèo đáng yêu và phụ kiện cao cấp tại cửa hàng ngay hôm nay nhé!
                      </p>
                      <Button as={Link} to="/" className="btn-primary-orange px-4 rounded-pill">
                        Khám phá sản phẩm ngay
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {orders.map((order) => {
                        const statusConfig =
                          ORDER_STATUS_LABELS[order.orderStatus] || {
                            text: order.orderStatus,
                            bg: 'secondary',
                            color: '#475569'
                          };

                        return (
                          <div key={order.id} className="profile-order-card">
                            <div className="profile-order-header">
                              <div>
                                <span className="profile-order-id">Mã đơn: #{order.id}</span>
                                <span className="mx-2 text-muted">•</span>
                                <span className="profile-order-date">
                                  {formatDate(order.orderDate)}
                                </span>
                              </div>

                              <Badge
                                bg={statusConfig.bg}
                                className="px-3 py-2 rounded-pill fw-bold"
                              >
                                {statusConfig.text}
                              </Badge>
                            </div>

                            {/* Danh sách items tóm tắt */}
                            <div className="my-2">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="profile-order-item-row">
                                  <img
                                    src={item.image || 'https://placehold.co/44x44?text=Pet'}
                                    alt={item.name}
                                    className="profile-order-thumb"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://placehold.co/44x44?text=Pet';
                                    }}
                                  />
                                  <div className="flex-grow-1">
                                    <div className="fw-bold text-dark text-truncate" style={{ maxWidth: 380 }}>
                                      {item.name}
                                    </div>
                                    <small className="text-muted">
                                      Số lượng: {item.quantity} × {formatCurrency(item.price)}
                                    </small>
                                  </div>
                                  <div className="text-end fw-semibold text-secondary">
                                    {formatCurrency(item.price * item.quantity)}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="profile-order-footer">
                              <div>
                                <small className="text-muted d-block">Tổng giá trị đơn hàng:</small>
                                <span className="profile-order-total">
                                  {formatCurrency(order.totalAmount)}
                                </span>
                              </div>

                              <Button
                                as={Link}
                                to={`/orders/${order.id}`}
                                variant="outline-dark"
                                size="sm"
                                className="rounded-pill px-3 fw-semibold"
                              >
                                Xem chi tiết <FaArrowRight className="ms-1" size={11} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BẢO MẬT & QUYỀN HẠN */}
              {activeTab === 'security' && (
                <div>
                  <div className="profile-card-header">
                    <div>
                      <h3 className="profile-card-title">
                        <FaShieldAlt className="title-icon" /> Tài khoản & Quyền hạn
                      </h3>
                      <p className="profile-card-subtitle">
                        Thông tin phân quyền và các tiện ích quản trị dành cho tài khoản của bạn.
                      </p>
                    </div>
                  </div>

                  <div className="security-info-box">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="security-info-title">Vai trò hệ thống (Role)</div>
                      <Badge bg="warning" text="dark" className="px-3 py-1 rounded-pill fw-bold">
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                    </div>
                    <p className="security-info-desc">
                      {user.role === 'admin'
                        ? 'Bạn có toàn quyền quản trị hệ thống, quản lý danh mục sản phẩm, đơn hàng và khách hàng.'
                        : user.role === 'staff'
                        ? 'Bạn có quyền nhân viên để xử lý đơn hàng và cập nhật danh mục sản phẩm.'
                        : 'Bạn là thành viên thân thiết của PET SHOP. Bạn được hưởng các quyền lợi ưu đãi và tích điểm khi mua sắm.'}
                    </p>
                  </div>

                  <div className="security-info-box">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="security-info-title">Trạng thái tài khoản</div>
                      <Badge bg="success" className="px-3 py-1 rounded-pill fw-bold">
                        Đang hoạt động (Active)
                      </Badge>
                    </div>
                    <p className="security-info-desc">
                      Tài khoản của bạn đang trong trạng thái an toàn và hoạt động bình thường.
                    </p>
                  </div>

                  <div className="security-info-box">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="security-info-title">Phiên đăng nhập</div>
                      <span className="text-muted small">Thiết bị hiện tại</span>
                    </div>
                    <p className="security-info-desc">
                      Đang đăng nhập với tên người dùng <strong>@{user.username}</strong>.
                    </p>
                  </div>

                  {/* Nút dành riêng cho Admin/Staff */}
                  {(user.role === 'admin' || user.role === 'staff') && (
                    <div className="p-3 mb-3 bg-light rounded-4 border">
                      <h6 className="fw-bold mb-2 text-dark">
                        <FaShieldAlt className="text-warning me-2" /> Lối tắt dành cho Quản trị viên
                      </h6>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <Button
                          as={Link}
                          to="/admin/categories"
                          variant="warning"
                          size="sm"
                          className="rounded-pill text-white fw-bold px-3"
                        >
                          Quản lý danh mục
                        </Button>
                        <Button
                          as={Link}
                          to="/admin/orders"
                          variant="primary"
                          size="sm"
                          className="rounded-pill fw-bold px-3"
                        >
                          Quản lý đơn hàng
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-top mt-4">
                    <Button
                      variant="outline-danger"
                      className="rounded-pill px-4 fw-semibold"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="me-2" /> Đăng xuất khỏi tài khoản
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* MODAL THAY ĐỔI ẢNH ĐẠI DIỆN */}
      <Modal
        show={showAvatarModal}
        onHide={() => setShowAvatarModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <FaCamera className="text-warning" /> Thay đổi ảnh đại diện
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="py-3">
          <div className="text-center mb-4">
            <div
              className="mx-auto rounded-circle overflow-hidden shadow-sm border border-3 border-warning"
              style={{ width: 100, height: 100 }}
            >
              {tempAvatarUrl ? (
                <img
                  src={tempAvatarUrl}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PRESET_AVATARS[0];
                  }}
                />
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-warning fs-1">
                  <FaPaw />
                </div>
              )}
            </div>
            <small className="text-muted d-block mt-2">Xem trước ảnh đại diện của bạn</small>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-secondary small">
              Cách 1: Chọn avatar thú cưng / nhân vật có sẵn
            </Form.Label>
            <div className="avatar-preset-grid">
              {PRESET_AVATARS.map((url, i) => (
                <div
                  key={i}
                  className={`avatar-preset-item ${tempAvatarUrl === url ? 'selected' : ''}`}
                  onClick={() => setTempAvatarUrl(url)}
                >
                  <img src={url} alt={`Avatar preset ${i}`} />
                </div>
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-secondary small">
              Cách 2: Tải ảnh từ máy tính của bạn
            </Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              size="sm"
              onChange={handleFileUpload}
              className="rounded-3"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="fw-semibold text-secondary small">
              Cách 3: Hoặc dán đường dẫn URL ảnh trực tuyến
            </Form.Label>
            <Form.Control
              type="url"
              size="sm"
              placeholder="https://example.com/avatar.jpg"
              value={tempAvatarUrl}
              onChange={(e) => setTempAvatarUrl(e.target.value)}
              className="rounded-3"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="light"
            className="rounded-pill px-4 fw-semibold"
            onClick={() => setShowAvatarModal(false)}
          >
            Hủy
          </Button>

          <Button
            className="btn-primary-orange rounded-pill px-4"
            onClick={handleApplyAvatar}
            disabled={savingProfile || !tempAvatarUrl}
          >
            {savingProfile ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              'Áp dụng ảnh này'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default ProfilePage;
