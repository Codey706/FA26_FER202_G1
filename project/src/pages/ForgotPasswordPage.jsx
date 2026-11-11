import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, InputGroup, Card } from 'react-bootstrap';
import {
  FaPaw,
  FaKey,
  FaEnvelope,
  FaUserAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheckCircle,
  FaInfoCircle,
  FaShieldAlt,
  FaMobileAlt,
  FaSignInAlt
} from 'react-icons/fa';
import authService from '../services/authService';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Wizard Step: 1 = Find Account, 2 = Verify OTP & Set New Password, 3 = Success
  const [step, setStep] = useState(1);

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Bước 1: Tìm tài khoản và gửi mã OTP giả lập
  const handleFindAccount = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.findUserForReset(identifier);
      // Tạo mã OTP ngẫu nhiên 6 chữ số
      const mockOtp = String(Math.floor(100000 + Math.random() * 900000));

      setFoundUser(user);
      setGeneratedOtp(mockOtp);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Không tìm thấy tài khoản. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác nhận OTP và đặt mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (otpInput.trim() !== generatedOtp.trim()) {
      setError('Mã xác thực OTP không chính xác. Vui lòng kiểm tra lại mã đã được cung cấp.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(foundUser.id, newPassword);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page py-4">
      <Container>
        <div className="auth-card" style={{ maxWidth: 880 }}>
          <Row className="g-0">
            {/* Banner bên trái */}
            <Col lg={5} className="auth-side d-none d-lg-flex">
              <div className="auth-side-content">
                <div className="auth-side-logo">
                  <FaKey />
                </div>
                <h2 className="auth-side-title">Khôi phục mật khẩu</h2>
                <p className="auth-side-text">
                  Đừng lo lắng! Hãy thực hiện theo hướng dẫn đơn giản để đặt lại mật khẩu và tiếp tục chăm sóc các bé cưng nhé.
                </p>

                <div className="p-3 rounded-4 bg-white bg-opacity-10 text-white small mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2 fw-bold text-white">
                    <FaShieldAlt /> Bảo mật tài khoản
                  </div>
                  <div>
                    Mã xác thực sẽ được gửi trực tiếp để đảm bảo chỉ chính bạn mới có thể thiết lập mật khẩu mới.
                  </div>
                </div>

                <Link
                  to="/login"
                  className="btn btn-outline-light rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 small fw-semibold"
                >
                  <FaArrowLeft /> Quay lại đăng nhập
                </Link>
              </div>
            </Col>

            {/* Khung thao tác bên phải */}
            <Col lg={7}>
              <div className="auth-form-wrap">
                {/* BƯỚC 1: NHẬP EMAIL / TÊN ĐĂNG NHẬP */}
                {step === 1 && (
                  <div>
                    <span className="section-badge">
                      <FaKey /> Quên mật khẩu
                    </span>
                    <h1 className="section-title mt-2 mb-1">
                      Tìm lại <span>mật khẩu</span>
                    </h1>
                    <p className="text-muted mb-4 small">
                      Nhập tên đăng nhập hoặc địa chỉ email bạn đã sử dụng để đăng ký tài khoản.
                    </p>

                    {error && (
                      <Alert variant="danger" className="rounded-3 py-2 small" role="alert">
                        {error}
                      </Alert>
                    )}

                    <Form onSubmit={handleFindAccount}>
                      <Form.Group className="mb-4" controlId="forgot-identifier">
                        <Form.Label className="fw-semibold small">
                          Email hoặc Tên đăng nhập
                        </Form.Label>
                        <InputGroup className="auth-input-group">
                          <InputGroup.Text>
                            <FaEnvelope />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Nhập email hoặc username..."
                            autoFocus
                            required
                          />
                        </InputGroup>
                        <Form.Text className="text-muted small">
                          Hệ thống sẽ kiểm tra tài khoản và gửi mã xác thực khôi phục.
                        </Form.Text>
                      </Form.Group>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="btn-primary-orange w-100 justify-content-center py-3"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                            Đang tìm kiếm...
                          </>
                        ) : (
                          'Tiếp tục xác nhận'
                        )}
                      </Button>

                      <div className="text-center mt-3 small">
                        <Link to="/login" className="text-muted text-decoration-none hover-orange">
                          <FaArrowLeft className="me-1" /> Nhớ lại mật khẩu? Đăng nhập ngay
                        </Link>
                      </div>
                    </Form>
                  </div>
                )}

                {/* BƯỚC 2: NHẬP MÃ OTP VÀ MẬT KHẨU MỚI */}
                {step === 2 && (
                  <div>
                    <span className="section-badge">
                      <FaMobileAlt /> Bước 2 / 2
                    </span>
                    <h1 className="section-title mt-2 mb-1">
                      Đặt <span>mật khẩu mới</span>
                    </h1>
                    <p className="text-muted mb-3 small">
                      Tài khoản tìm thấy: <strong>{foundUser?.fullName}</strong> ({foundUser?.maskedEmail})
                    </p>

                    {/* Hộp hiển thị mã OTP demo (dành cho môi trường mock json-server) */}
                    <Alert variant="warning" className="rounded-4 p-3 mb-4 small border-warning">
                      <div className="d-flex align-items-center gap-2 fw-bold text-dark mb-1">
                        <FaInfoCircle className="text-warning fs-5" />
                        <span>Mô phỏng tin nhắn OTP gửi đến email:</span>
                      </div>
                      <div className="text-dark">
                        Mã OTP xác thực của bạn là:{' '}
                        <span className="badge bg-danger fs-6 px-3 py-1 ms-1 letter-spacing-1">
                          {generatedOtp}
                        </span>
                        <div className="mt-1 text-muted" style={{ fontSize: '0.8rem' }}>
                          (Trong môi trường thử nghiệm, mã OTP được hiển thị trực tiếp để bạn dễ dàng kiểm thử)
                        </div>
                      </div>
                    </Alert>

                    {error && (
                      <Alert variant="danger" className="rounded-3 py-2 small" role="alert">
                        {error}
                      </Alert>
                    )}

                    <Form onSubmit={handleResetPassword}>
                      {/* Mã OTP */}
                      <Form.Group className="mb-3" controlId="reset-otp">
                        <Form.Label className="fw-semibold small">
                          Mã xác thực OTP (6 chữ số) <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup className="auth-input-group">
                          <InputGroup.Text>
                            <FaKey />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            maxLength={6}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                            placeholder={`Nhập ${generatedOtp}`}
                            required
                            autoFocus
                          />
                        </InputGroup>
                      </Form.Group>

                      {/* Mật khẩu mới */}
                      <Form.Group className="mb-3" controlId="reset-newPassword">
                        <Form.Label className="fw-semibold small">
                          Mật khẩu mới <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup className="auth-input-group">
                          <InputGroup.Text>
                            <FaLock />
                          </InputGroup.Text>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Tối thiểu 6 ký tự"
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

                      {/* Xác nhận mật khẩu mới */}
                      <Form.Group className="mb-4" controlId="reset-confirmPassword">
                        <Form.Label className="fw-semibold small">
                          Xác nhận mật khẩu mới <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup className="auth-input-group">
                          <InputGroup.Text>
                            <FaLock />
                          </InputGroup.Text>
                          <Form.Control
                            type={showConfirmPw ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
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

                      <div className="d-flex gap-2">
                        <Button
                          type="button"
                          variant="light"
                          className="px-3 rounded-pill"
                          onClick={() => {
                            setStep(1);
                            setError('');
                          }}
                        >
                          <FaArrowLeft />
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="btn-primary-orange flex-grow-1 justify-content-center py-3"
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                              Đang lưu mật khẩu mới...
                            </>
                          ) : (
                            'Xác nhận đặt lại mật khẩu'
                          )}
                        </Button>
                      </div>
                    </Form>
                  </div>
                )}

                {/* BƯỚC 3: THÀNH CÔNG */}
                {step === 3 && (
                  <div className="text-center py-4">
                    <div
                      className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-3"
                      style={{ width: 80, height: 80, fontSize: '2.5rem' }}
                    >
                      <FaCheckCircle />
                    </div>
                    <h3 className="fw-bold mb-2">Đổi mật khẩu thành công!</h3>
                    <p className="text-muted mb-4">
                      Mật khẩu của tài khoản <strong>{foundUser?.fullName}</strong> đã được cập nhật thành công. Hãy sử dụng mật khẩu mới để đăng nhập.
                    </p>
                    <Button
                      as={Link}
                      to="/login"
                      className="btn-primary-orange px-4 py-2"
                    >
                      <FaSignInAlt className="me-2" /> Đăng nhập ngay
                    </Button>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </main>
  );
};

export default ForgotPasswordPage;
