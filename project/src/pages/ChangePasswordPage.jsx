import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
  FaShieldAlt,
  FaUserAlt,
  FaArrowLeft,
  FaKey
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

const ChangePasswordPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (feedback.message) setFeedback({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    const { currentPassword, newPassword, confirmPassword } = form;

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
      setLoading(true);
      await userService.changePassword(user.id, currentPassword, newPassword);

      setForm({
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
      setLoading(false);
    }
  };

  return (
    <main className="py-5" style={{ background: '#fff9f2', minHeight: '80vh' }}>
      <Container>
        {/* Breadcrumb Navigation */}
        <div className="d-flex align-items-center gap-2 mb-4 text-muted small">
          <Link to="/" className="text-secondary text-decoration-none">Trang chủ</Link>
          <span>/</span>
          <Link to="/profile" className="text-secondary text-decoration-none">Hồ sơ cá nhân</Link>
          <span>/</span>
          <span className="text-dark fw-bold">Đổi mật khẩu</span>
        </div>

        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="p-4 text-white"
                style={{ background: 'var(--primary-gradient, linear-gradient(135deg, #ff8a00 0%, #ff5200 100%))' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20 text-white"
                    style={{ width: 48, height: 48, fontSize: '1.25rem' }}
                  >
                    <FaKey />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1 text-white">Đổi mật khẩu</h4>
                    <p className="mb-0 text-white text-opacity-75 small">
                      Bảo vệ tài khoản {user?.fullName} ({user?.username})
                    </p>
                  </div>
                </div>
              </div>

              <Card.Body className="p-4 p-md-5">
                {feedback.message && (
                  <Alert
                    variant={feedback.type}
                    dismissible
                    onClose={() => setFeedback({ type: '', message: '' })}
                    className="d-flex align-items-center gap-2 rounded-3 small mb-4"
                  >
                    {feedback.type === 'success' ? (
                      <FaCheckCircle className="fs-5 flex-shrink-0" />
                    ) : (
                      <FaExclamationCircle className="fs-5 flex-shrink-0" />
                    )}
                    <div>{feedback.message}</div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Mật khẩu hiện tại */}
                  <Form.Group className="mb-3" controlId="change-currentPassword">
                    <Form.Label className="fw-semibold small text-secondary">
                      Mật khẩu hiện tại <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup className="auth-input-group">
                      <InputGroup.Text>
                        <FaLock />
                      </InputGroup.Text>
                      <Form.Control
                        type={showCurrentPw ? 'text' : 'password'}
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu hiện tại..."
                        required
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="light"
                        className="auth-toggle-pw"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        tabIndex={-1}
                      >
                        {showCurrentPw ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  {/* Mật khẩu mới */}
                  <Form.Group className="mb-3" controlId="change-newPassword">
                    <Form.Label className="fw-semibold small text-secondary">
                      Mật khẩu mới <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup className="auth-input-group">
                      <InputGroup.Text>
                        <FaLock />
                      </InputGroup.Text>
                      <Form.Control
                        type={showNewPw ? 'text' : 'password'}
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        placeholder="Tối thiểu 6 ký tự..."
                        required
                      />
                      <Button
                        type="button"
                        variant="light"
                        className="auth-toggle-pw"
                        onClick={() => setShowNewPw(!showNewPw)}
                        tabIndex={-1}
                      >
                        {showNewPw ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted small">
                      Nên kết hợp chữ cái và số để tăng tính bảo mật.
                    </Form.Text>
                  </Form.Group>

                  {/* Xác nhận mật khẩu mới */}
                  <Form.Group className="mb-4" controlId="change-confirmPassword">
                    <Form.Label className="fw-semibold small text-secondary">
                      Xác nhận mật khẩu mới <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup className="auth-input-group">
                      <InputGroup.Text>
                        <FaLock />
                      </InputGroup.Text>
                      <Form.Control
                        type={showConfirmPw ? 'text' : 'password'}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu mới..."
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

                  <div className="d-flex align-items-center justify-content-between pt-2">
                    <Button
                      as={Link}
                      to="/profile"
                      variant="outline-secondary"
                      className="rounded-pill px-4"
                    >
                      <FaArrowLeft className="me-2" /> Về hồ sơ
                    </Button>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="btn-primary-orange px-4 py-2 rounded-pill"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Đang cập nhật...
                        </>
                      ) : (
                        'Lưu mật khẩu mới'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ChangePasswordPage;
