import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  FaHeart
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
    const from = location.state?.from;
    if (from?.pathname) {
      // Giữ nguyên search + state (vd: sản phẩm "Mua ngay" gửi sang /checkout).
      return (
        <Navigate
          to={{ pathname: from.pathname, search: from.search || '' }}
          state={from.state}
          replace
        />
      );
    }
    return <Navigate to={getDefaultRoute(user)} replace />;
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
                <p className="text-muted mb-4">
                  Nhập tên đăng nhập hoặc email cùng mật khẩu của bạn.
                </p>

                {error && (
                  <Alert variant="danger" className="rounded-3 py-2" role="alert">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="login-identifier">
                    <Form.Label className="fw-semibold">Tên đăng nhập hoặc Email</Form.Label>
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
                    <Form.Label className="fw-semibold">Mật khẩu</Form.Label>
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

                  <Form.Check
                    type="checkbox"
                    id="login-remember"
                    name="remember"
                    label="Ghi nhớ đăng nhập"
                    checked={form.remember}
                    onChange={handleChange}
                    className="mb-4 auth-remember"
                  />

                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary-orange w-100 justify-content-center py-3"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt /> Đăng nhập
                      </>
                    )}
                  </Button>
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