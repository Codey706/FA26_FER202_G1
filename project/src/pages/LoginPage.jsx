import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import {
  FaPaw,
  FaUserAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaShieldAlt,
  FaTruck,
  FaHeart,
  FaKey,
  FaUserPlus
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const PERKS = [
  { icon: <FaShieldAlt />, text: 'Cam kết 100% thú cưng thuần chủng' },
  { icon: <FaTruck />, text: 'Theo dõi đơn hàng & giao hàng dễ dàng' },
  { icon: <FaHeart />, text: 'Ưu đãi riêng dành cho thành viên' }
];

// Admin / nhân viên vào trang quản lý, khách hàng về trang chủ
const getDefaultRoute = (user) =>
  user.role === 'admin' || user.role === 'staff' ? '/admin/orders' : '/';

const LoginPage = () => {
  const { user, login } = useAuth();
  const location = useLocation();

  const [form, setForm] = useState({ identifier: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Đã đăng nhập (kể cả vừa đăng nhập xong) -> quay lại trang đang muốn vào hoặc trang mặc định
  if (user) {
    const from = location.state?.from?.pathname;
    return <Navigate to={from || getDefaultRoute(user)} replace />;
  }

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form);
      // Việc chuyển trang do <Navigate> ở trên xử lý khi `user` được cập nhật
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  // Nạp nhanh tài khoản mẫu phục vụ kiểm thử
  const handleQuickLogin = (identifier, password) => {
    setForm({ identifier, password, remember: true });
    setError('');
  };

  return (
    <main className="auth-page">
      <Container>
        <div className="auth-card">
          <Row className="g-0">
            {/* Panel thương hiệu bên trái */}
            <Col lg={5} className="auth-side d-none d-lg-flex">
              <div className="auth-side-content">
                <div className="auth-side-logo">
                  <FaPaw />
                </div>
                <h2 className="auth-side-title">Chào mừng trở lại với PET SHOP</h2>
                <p className="auth-side-text">
                  Đăng nhập để theo dõi đơn hàng và đón bé thú cưng về nhà thật nhanh nhé!
                </p>
                <ul className="auth-perks">
                  {PERKS.map((perk) => (
                    <li key={perk.text}>
                      <span className="auth-perk-icon">{perk.icon}</span>
                      <span>{perk.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 border-top border-white border-opacity-25 text-white-50 small">
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className="text-white fw-bold text-decoration-underline ms-1">
                    Đăng ký miễn phí
                  </Link>
                </div>
              </div>
            </Col>

            {/* Form đăng nhập */}
            <Col lg={7}>
              <div className="auth-form-wrap">
                <span className="section-badge">
                  <FaSignInAlt /> Đăng nhập
                </span>
                <h1 className="section-title mt-2 mb-1">
                  Đăng nhập <span>tài khoản</span>
                </h1>
                <p className="text-muted mb-4 small">
                  Nhập tên đăng nhập hoặc email cùng mật khẩu của bạn.
                </p>

                {error && (
                  <Alert variant="danger" className="rounded-3 py-2 small" role="alert">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="login-identifier">
                    <Form.Label className="fw-semibold small">Tên đăng nhập hoặc Email</Form.Label>
                    <InputGroup className="auth-input-group">
                      <InputGroup.Text>
                        <FaUserAlt />
                      </InputGroup.Text>
                      <Form.Control
                        name="identifier"
                        value={form.identifier}
                        onChange={handleChange}
                        placeholder="Tên đăng nhập hoặc email"
                        autoComplete="username"
                        autoFocus
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="login-password">
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Label className="fw-semibold small mb-1">Mật khẩu</Form.Label>
                      <Link
                        to="/forgot-password"
                        className="small text-warning text-decoration-none fw-semibold"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <InputGroup className="auth-input-group">
                      <InputGroup.Text>
                        <FaLock />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu"
                        autoComplete="current-password"
                        required
                      />
                      <Button
                        type="button"
                        variant="light"
                        className="auth-toggle-pw"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <Form.Check
                      type="checkbox"
                      id="login-remember"
                      name="remember"
                      label="Ghi nhớ đăng nhập"
                      checked={form.remember}
                      onChange={handleChange}
                      className="auth-remember small mb-0"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary-orange w-100 justify-content-center py-3"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="me-2" /> Đăng nhập
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-3 small text-muted">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-warning fw-bold">
                      Đăng ký ngay
                    </Link>
                  </div>

                  {/* Nút đăng nhập nhanh cho demo / chấm bài */}
                  <div className="auth-demo mt-4">
                    <div className="auth-demo-title">
                      <FaKey /> Điền nhanh tài khoản thử nghiệm:
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="auth-demo-chip"
                        onClick={() => handleQuickLogin('admin_matpet', 'admin123')}
                      >
                        👑 Admin
                      </button>
                      <button
                        type="button"
                        className="auth-demo-chip"
                        onClick={() => handleQuickLogin('staff_huong', 'staff123')}
                      >
                        👔 Staff
                      </button>
                      <button
                        type="button"
                        className="auth-demo-chip"
                        onClick={() => handleQuickLogin('customer_nam', '123456')}
                      >
                        🛒 Khách hàng
                      </button>
                    </div>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </main>
  );
};

export default LoginPage;
