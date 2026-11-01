import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

/**
 * Bảo vệ route: bắt buộc đăng nhập, có thể giới hạn theo vai trò.
 * <RequireAuth roles={['admin', 'staff']}> ... </RequireAuth>
 */
const RequireAuth = ({ roles, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Chưa đăng nhập -> chuyển tới /login, nhớ trang muốn vào để quay lại sau
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Đã đăng nhập nhưng không đủ quyền
  if (roles && !roles.includes(user.role)) {
    return (
      <main className="py-5" style={{ background: '#fffaf5', minHeight: '65vh' }}>
        <Container>
          <div className="bg-white rounded-4 shadow-sm text-center p-5 mx-auto" style={{ maxWidth: 520 }}>
            <FaLock className="display-3 text-warning mb-3" />
            <h4 className="fw-bold">Bạn không có quyền truy cập</h4>
            <p className="text-muted">
              Trang này chỉ dành cho quản trị viên và nhân viên của cửa hàng.
            </p>
            <Button as={Link} to="/" variant="warning" className="text-white fw-bold rounded-pill px-4">
              <FaArrowLeft className="me-2" /> Về trang chủ
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  return children;
};

export default RequireAuth;
