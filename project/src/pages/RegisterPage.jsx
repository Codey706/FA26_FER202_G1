import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, InputGroup, Card } from 'react-bootstrap';
import {
  FaPaw,
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaShieldAlt,
  FaGift,
  FaTruck,
  FaHeartbeat,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaSignInAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const REGISTER_PERKS = [
  { icon: <FaShieldAlt />, text: 'Bảo hành sức khỏe 100% thú cưng thuần chủng' },
  { icon: <FaGift />, text: 'Tích lũy điểm thưởng & ưu đãi độc quyền thành viên' },
  { icon: <FaTruck />, text: 'Giao hàng tận nơi, theo dõi đơn hàng dễ dàng' },
  { icon: <FaHeartbeat />, text: 'Tư vấn dinh dưỡng & y tế thú cưng miễn phí' }
];

const RegisterPage = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Nếu người dùng đã đăng nhập thì điều hướng về trang chủ
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      setError('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách của Pet Shop.');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password
      }, false); // không auto-login để hiện thông báo thành công rõ ràng

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Đăng ký không thành công. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <main className="auth-page py-4">
      <Container>
        <div className="auth-card" style={{ maxWidth: 1040 }}>
          <Row className="g-0">
            {/* Panel thương hiệu bên trái */}
            <Col lg={5} className="auth-side d-none d-lg-flex">
              <div className="auth-side-content">
                <div className="auth-side-logo">
                  <FaPaw />
                </div>
                <h2 className="auth-side-title">Gia nhập ngôi nhà PET SHOP</h2>
                <p className="auth-side-text">
                  Đăng ký tài khoản ngay hôm nay để đón các bé cưng xinh xắn và nhận hàng loạt ưu đãi hấp dẫn dành riêng cho thành viên!
                </p>
                <ul className="auth-perks">
                  {REGISTER_PERKS.map((perk) => (
                    <li key={perk.text}>
                      <span className="auth-perk-icon">{perk.icon}</span>
                      <span>{perk.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 border-top border-white border-opacity-25 text-white-50 small">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="text-white fw-bold text-decoration-underline ms-1">
                    Đăng nhập tại đây
                  </Link>
                </div>
              </div>
            </Col>

            {/* Form đăng ký bên phải */}
            <Col lg={7}>
              <div className="auth-form-wrap">
                {success ? (
                  <div className="text-center py-4">
                    <div
                      className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-3"
                      style={{ width: 80, height: 80, fontSize: '2.5rem' }}
                    >
                      <FaCheckCircle />
                    </div>
                    <h3 className="fw-bold mb-2">Đăng ký tài khoản thành công!</h3>
                    <p className="text-muted mb-4">
                      Chúc mừng bạn đã trở thành thành viên của <strong>PET SHOP</strong>. Bây giờ bạn có thể đăng nhập để trải nghiệm dịch vụ.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <Button
                        as={Link}
                        to="/login"
                        className="btn-primary-orange px-4 py-2"
                      >
                        <FaSignInAlt className="me-2" /> Đăng nhập ngay
                      </Button>
                      <Button
                        as={Link}
                        to="/"
                        variant="outline-secondary"
                        className="rounded-pill px-4"
                      >
                        Về trang chủ
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="section-badge">
                      <FaUserPlus /> Đăng ký
                    </span>
                    <h1 className="section-title mt-2 mb-1">
                      Tạo tài khoản <span>thành viên</span>
                    </h1>
                    <p className="text-muted mb-4 small">
                      Điền đầy đủ thông tin bên dưới để đăng ký tài khoản khách hàng mới.
                    </p>

                    {error && (
                      <Alert variant="danger" className="rounded-3 py-2 small" role="alert">
                        {error}
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                      <Row className="g-3">
                        {/* Họ và tên */}
                        <Col md={12}>
                          <Form.Group controlId="register-fullName">
                            <Form.Label className="fw-semibold small">
                              Họ và tên <span className="text-danger">*</span>
                            </Form.Label>
                            <InputGroup className="auth-input-group">
                              <InputGroup.Text>
                                <FaUserAlt />
                              </InputGroup.Text>
                              <Form.Control
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Ví dụ: Nguyễn Văn A"
                                required
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>

                        {/* Tên đăng nhập */}
                        <Col md={6}>
                          <Form.Group controlId="register-username">
                            <Form.Label className="fw-semibold small">
                              Tên đăng nhập <span className="text-danger">*</span>
                            </Form.Label>
                            <InputGroup className="auth-input-group">
                              <InputGroup.Text>@</InputGroup.Text>
                              <Form.Control
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="nguyenvana"
                                autoComplete="username"
                                required
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>

                        {/* Email */}
                        <Col md={6}>
                          <Form.Group controlId="register-email">
                            <Form.Label className="fw-semibold small">
                              Địa chỉ Email <span className="text-danger">*</span>
                            </Form.Label>
                            <InputGroup className="auth-input-group">
                              <InputGroup.Text>
                                <FaEnvelope />
                              </InputGroup.Text>
                              <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="vana@gmail.com"
                                autoComplete="email"
                                required
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>

                        {/* Số điện thoại */}
                        <Col md={6}>
                          <Form.Group controlId="register-phone">
                            <Form.Label className="fw-semibold small">
                              Số điện thoại <span className="text-danger">*</span>
                            </Form.Label>
                            <InputGroup className="auth-input-group">
                              <InputGroup.Text>
                                <FaPhoneAlt />
                              </InputGroup.Text>
                              <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0987654321"
                                required
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>

                        {/* Địa chỉ giao hàng */}
                        <Col md={6}>
                          <Form.Group controlId="register-address">
                            <Form.Label className="fw-semibold small">
                              Địa chỉ nhận hàng (tùy chọn)
                            </Form.Label>
                            <InputGroup className="auth-input-group">
                              <InputGroup.Text>
                                <FaMapMarkerAlt />
                              </InputGroup.Text>
                              <Form.Control
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Số nhà, đường, quận/huyện..."
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>

                        {/* Mật khẩu */}
                        <Col md={6}>
                          <Form.Group controlId="register-password">
                            <Form.Label className="fw-semibold small">
                              Mật khẩu <span className="text-danger">*</span>
                            </Form.Label>
                            <InputGroup className="auth-input-group">
                              <InputGroup.Text>
                                <FaLock />
                              </InputGroup.Text>
                              <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Tối thiểu 6 ký tự"
                                autoComplete="new-password"
                                required
                              />
                              <Button
                                type="button"
                                variant="light"
                                className="auth-toggle-pw"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                            </InputGroup>
                          </Form.Group>
                        </Col>

                        {/* Xác nhận mật khẩu */}
                        <Col md={6}>
                          <Form.Group controlId="register-confirmPassword">
                            <Form.Label className="fw-semibold small">
                              Xác nhận mật khẩu <span className="text-danger">*</span>
                            </Form.Label>
                            <InputGroup className="auth-input-group">
                              <InputGroup.Text>
                                <FaLock />
                              </InputGroup.Text>
                              <Form.Control
                                type={showConfirmPw ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu"
                                autoComplete="new-password"
                                required
                              />
                              <Button
                                type="button"
                                variant="light"
                                className="auth-toggle-pw"
                                onClick={() => setShowConfirmPw(!showConfirmPw)}
                                tabIndex={-1}
                              >
                                {showConfirmPw ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Điều khoản */}
                      <Form.Check
                        type="checkbox"
                        id="register-terms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="mt-3 mb-4 auth-remember small"
                        label={
                          <span className="text-muted">
                            Tôi đồng ý với{' '}
                            <span className="text-warning fw-semibold">Điều khoản dịch vụ</span> và{' '}
                            <span className="text-warning fw-semibold">Chính sách bảo mật</span> của Pet Shop.
                          </span>
                        }
                        required
                      />

                      <Button
                        type="submit"
                        disabled={loading}
                        className="btn-primary-orange w-100 justify-content-center py-3"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                            Đang xử lý đăng ký...
                          </>
                        ) : (
                          <>
                            <FaUserPlus className="me-2" /> Đăng ký tài khoản
                          </>
                        )}
                      </Button>

                      <div className="text-center mt-3 small text-muted">
                        Bạn đã có tài khoản?{' '}
                        <Link to="/login" className="text-warning fw-bold">
                          Đăng nhập ngay
                        </Link>
                      </div>
                    </Form>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </main>
  );
};

export default RegisterPage;
