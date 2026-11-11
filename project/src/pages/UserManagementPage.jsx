import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  InputGroup,
  Badge,
  Alert,
  Spinner,
  Table
} from 'react-bootstrap';
import {
  FaUsers,
  FaUserPlus,
  FaUserShield,
  FaUserTie,
  FaUserCheck,
  FaUserLock,
  FaSearch,
  FaEdit,
  FaTrash,
  FaKey,
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import '../styles/UserManagementPage.css';

const INITIAL_ADD_FORM = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  address: '',
  role: 'customer',
  status: 'active',
  password: '',
  confirmPassword: ''
};

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

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal: Add User
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(INITIAL_ADD_FORM);
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Modal: Edit User
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    role: 'customer',
    status: 'active'
  });

  // Modal: Reset Password
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Modal: Delete User
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  // Load Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.message || 'Không thể tải danh sách người dùng.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const keyword = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        (u.fullName && u.fullName.toLowerCase().includes(keyword)) ||
        (u.username && u.username.toLowerCase().includes(keyword)) ||
        (u.email && u.email.toLowerCase().includes(keyword)) ||
        (u.phone && u.phone.includes(keyword));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const staffs = users.filter((u) => u.role === 'staff').length;
    const customers = users.filter((u) => u.role === 'customer').length;
    const inactives = users.filter((u) => u.status === 'inactive').length;
    return { total, admins, staffs, customers, inactives };
  }, [users]);

  // ================= ADD USER =================
  const handleOpenAddModal = () => {
    setAddForm(INITIAL_ADD_FORM);
    setShowAddPassword(false);
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (addForm.password !== addForm.confirmPassword) {
      alert('Mật khẩu và xác nhận mật khẩu không trùng khớp.');
      return;
    }
    if (addForm.password.length < 6) {
      alert('Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }

    try {
      setActionLoading(true);
      await userService.createUser({
        fullName: addForm.fullName,
        username: addForm.username,
        email: addForm.email,
        phone: addForm.phone,
        address: addForm.address,
        role: addForm.role,
        status: addForm.status,
        password: addForm.password
      });

      setShowAddModal(false);
      setFeedback({
        type: 'success',
        message: `Đã thêm thành công người dùng mới "${addForm.fullName}"!`
      });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Thêm người dùng thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  // ================= EDIT USER =================
  const handleOpenEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setEditForm({
      fullName: targetUser.fullName || '',
      username: targetUser.username || '',
      email: targetUser.email || '',
      phone: targetUser.phone || '',
      address: targetUser.address || '',
      role: targetUser.role || 'customer',
      status: targetUser.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    // Không cho phép tự tước quyền admin của chính mình nếu là admin duy nhất
    if (
      String(editingUser.id) === String(currentUser?.id) &&
      editForm.role !== 'admin' &&
      stats.admins <= 1
    ) {
      alert('Bạn là quản trị viên duy nhất trong hệ thống, không thể tự chuyển đổi vai trò!');
      return;
    }

    // Không cho phép tự khóa tài khoản của mình
    if (
      String(editingUser.id) === String(currentUser?.id) &&
      editForm.status === 'inactive'
    ) {
      alert('Bạn không thể tự khóa tài khoản quản trị viên của chính mình!');
      return;
    }

    try {
      setActionLoading(true);
      await userService.updateUserAdmin(editingUser.id, editForm);

      setShowEditModal(false);
      setFeedback({
        type: 'success',
        message: `Cập nhật thông tin người dùng "${editForm.fullName}" thành công!`
      });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Cập nhật thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (targetUser) => {
    if (String(targetUser.id) === String(currentUser?.id)) {
      alert('Bạn không thể tự khóa tài khoản của chính mình!');
      return;
    }

    const actionText = targetUser.status === 'active' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${targetUser.fullName}"?`)) {
      return;
    }

    try {
      await userService.toggleUserStatus(targetUser.id, targetUser.status);
      setFeedback({
        type: 'success',
        message: `Đã ${actionText} tài khoản "${targetUser.fullName}" thành công.`
      });
      fetchUsers();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.message || 'Không thể đổi trạng thái tài khoản.'
      });
    }
  };

  // ================= RESET PASSWORD =================
  const handleOpenResetModal = (targetUser) => {
    setResetTargetUser(targetUser);
    setResetPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowResetPassword(false);
    setShowResetModal(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetTargetUser) return;

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      alert('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    if (resetPasswordForm.newPassword.length < 6) {
      alert('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    try {
      setActionLoading(true);
      await userService.adminResetPassword(resetTargetUser.id, resetPasswordForm.newPassword);

      setShowResetModal(false);
      setFeedback({
        type: 'success',
        message: `Đã cấp lại mật khẩu mới cho người dùng "${resetTargetUser.fullName}" thành công!`
      });
    } catch (err) {
      alert(err.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  // ================= DELETE USER =================
  const handleOpenDeleteModal = (targetUser) => {
    if (String(targetUser.id) === String(currentUser?.id)) {
      alert('Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }

    if (targetUser.role === 'admin' && stats.admins <= 1) {
      alert('Đây là Quản trị viên duy nhất trong hệ thống, không thể xóa!');
      return;
    }

    setDeletingUser(targetUser);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    try {
      setActionLoading(true);
      await userService.deleteUser(deletingUser.id);

      setShowDeleteModal(false);
      setFeedback({
        type: 'success',
        message: `Đã xóa tài khoản "${deletingUser.fullName}" khỏi hệ thống.`
      });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Xóa tài khoản thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="user-management-page">
      <Container fluid="lg">
        {/* Header */}
        <div className="user-management-header">
          <div>
            <div className="user-management-badge">
              <FaUsers /> HỆ THỐNG QUẢN TRỊ ADMIN
            </div>
            <h1>
              Quản lý <span>Người dùng</span>
            </h1>
            <p>
              Xem danh sách, phân quyền thành viên (Admin, Staff, Customer) và kiểm soát trạng thái tài khoản.
            </p>
          </div>

          <Button
            type="button"
            className="btn-primary-orange px-4 py-2 rounded-pill fw-bold"
            onClick={handleOpenAddModal}
          >
            <FaUserPlus className="me-2" /> Thêm người dùng mới
          </Button>
        </div>

        {/* Global Feedback */}
        {feedback.message && (
          <Alert
            variant={feedback.type}
            dismissible
            onClose={() => setFeedback({ type: '', message: '' })}
            className="rounded-4 shadow-sm mb-4"
          >
            {feedback.message}
          </Alert>
        )}

        {/* Stat Cards */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3} lg>
            <div className="user-stat-card">
              <div className="user-stat-icon bg-warning bg-opacity-10 text-warning">
                <FaUsers />
              </div>
              <div className="user-stat-info">
                <h3>{stats.total}</h3>
                <span>Tổng tài khoản</span>
              </div>
            </div>
          </Col>

          <Col xs={6} md={3} lg>
            <div className="user-stat-card">
              <div className="user-stat-icon bg-danger bg-opacity-10 text-danger">
                <FaUserShield />
              </div>
              <div className="user-stat-info">
                <h3>{stats.admins}</h3>
                <span>Quản trị viên (Admin)</span>
              </div>
            </div>
          </Col>

          <Col xs={6} md={3} lg>
            <div className="user-stat-card">
              <div className="user-stat-icon bg-info bg-opacity-10 text-info">
                <FaUserTie />
              </div>
              <div className="user-stat-info">
                <h3>{stats.staffs}</h3>
                <span>Nhân viên (Staff)</span>
              </div>
            </div>
          </Col>

          <Col xs={6} md={3} lg>
            <div className="user-stat-card">
              <div className="user-stat-icon bg-success bg-opacity-10 text-success">
                <FaUserCheck />
              </div>
              <div className="user-stat-info">
                <h3>{stats.customers}</h3>
                <span>Khách hàng</span>
              </div>
            </div>
          </Col>

          <Col xs={12} md={3} lg>
            <div className="user-stat-card">
              <div className="user-stat-icon bg-secondary bg-opacity-10 text-secondary">
                <FaUserLock />
              </div>
              <div className="user-stat-info">
                <h3>{stats.inactives}</h3>
                <span>Đang bị khóa</span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Main Card */}
        <div className="user-table-card">
          {/* Filter Bar */}
          <div className="user-filter-bar">
            <Row className="g-3 align-items-center">
              <Col lg={5} md={6}>
                <InputGroup>
                  <InputGroup.Text className="bg-transparent border-end-0 text-muted rounded-start-pill ps-3">
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Tìm theo họ tên, username, email, SĐT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="user-search-input border-start-0"
                  />
                  {searchTerm && (
                    <Button
                      variant="light"
                      className="border-start-0 rounded-end-pill text-muted"
                      onClick={() => setSearchTerm('')}
                    >
                      ✕
                    </Button>
                  )}
                </InputGroup>
              </Col>

              <Col lg={3} sm={6}>
                <Form.Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="user-filter-select"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                  <option value="staff">Nhân viên (Staff)</option>
                  <option value="customer">Khách hàng</option>
                </Form.Select>
              </Col>

              <Col lg={2} sm={6}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="user-filter-select"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Đã khóa</option>
                </Form.Select>
              </Col>

              <Col lg={2} className="text-end">
                <Button
                  variant="outline-secondary"
                  className="rounded-pill px-3 py-2 small d-inline-flex align-items-center gap-2"
                  onClick={fetchUsers}
                  disabled={loading}
                >
                  <FaSyncAlt className={loading ? 'fa-spin' : ''} />
                  <span>Tải lại</span>
                </Button>
              </Col>
            </Row>
          </div>

          {/* Table Container */}
          <div className="user-table-wrapper">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="warning" />
                <p className="text-muted mt-2 small">Đang tải danh sách người dùng...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-5">
                <div className="fs-1 text-muted mb-2">🔍</div>
                <h5 className="fw-bold text-dark">Không tìm thấy người dùng phù hợp</h5>
                <p className="text-muted small">Hãy thử tìm với từ khóa hoặc bộ lọc khác.</p>
              </div>
            ) : (
              <Table responsive hover className="user-table mb-0">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Liên hệ</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((item) => {
                    const isSelf = String(item.id) === String(currentUser?.id);

                    return (
                      <tr key={item.id}>
                        {/* Profile */}
                        <td>
                          <div className="user-profile-cell">
                            {item.avatar ? (
                              <img
                                src={item.avatar}
                                alt={item.fullName}
                                className="user-avatar-small"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="user-avatar-placeholder"
                              style={{ display: item.avatar ? 'none' : 'flex' }}
                            >
                              {(item.fullName || item.username || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="user-name-title">
                                {item.fullName}
                                {isSelf && (
                                  <Badge bg="secondary" className="ms-2 small">
                                    Bạn
                                  </Badge>
                                )}
                              </div>
                              <div className="user-username-sub">@{item.username}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td>
                          <div className="small text-dark mb-1 d-flex align-items-center gap-1">
                            <FaEnvelope className="text-muted" size={12} />
                            <span>{item.email}</span>
                          </div>
                          {item.phone && (
                            <div className="small text-muted d-flex align-items-center gap-1">
                              <FaPhoneAlt className="text-muted" size={12} />
                              <span>{item.phone}</span>
                            </div>
                          )}
                        </td>

                        {/* Role */}
                        <td>
                          {item.role === 'admin' ? (
                            <span className="badge-role-admin">
                              <FaUserShield /> Quản trị viên
                            </span>
                          ) : item.role === 'staff' ? (
                            <span className="badge-role-staff">
                              <FaUserTie /> Nhân viên
                            </span>
                          ) : (
                            <span className="badge-role-customer">
                              <FaUserCheck /> Khách hàng
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          {item.status === 'active' ? (
                            <span className="badge-status-active">
                              <FaCheckCircle /> Hoạt động
                            </span>
                          ) : (
                            <span className="badge-status-inactive">
                              <FaLock /> Đã khóa
                            </span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="small text-muted">{formatDate(item.createdAt)}</td>

                        {/* Actions */}
                        <td>
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            {/* Khóa / Mở khóa */}
                            <Button
                              variant={item.status === 'active' ? 'outline-warning' : 'outline-success'}
                              className="user-action-btn"
                              title={item.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                              onClick={() => handleToggleStatus(item)}
                              disabled={isSelf}
                            >
                              {item.status === 'active' ? <FaLock /> : <FaUnlock />}
                            </Button>

                            {/* Cấp lại mật khẩu */}
                            <Button
                              variant="outline-primary"
                              className="user-action-btn"
                              title="Đặt lại mật khẩu cho tài khoản"
                              onClick={() => handleOpenResetModal(item)}
                            >
                              <FaKey />
                            </Button>

                            {/* Sửa thông tin */}
                            <Button
                              variant="outline-info"
                              className="user-action-btn"
                              title="Chỉnh sửa thông tin"
                              onClick={() => handleOpenEditModal(item)}
                            >
                              <FaEdit />
                            </Button>

                            {/* Xóa tài khoản */}
                            <Button
                              variant="outline-danger"
                              className="user-action-btn"
                              title="Xóa người dùng"
                              onClick={() => handleOpenDeleteModal(item)}
                              disabled={isSelf}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </div>
        </div>

        {/* MODAL 1: THÊM NGƯỜI DÙNG MỚI */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <FaUserPlus className="text-warning" /> Thêm người dùng mới
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddSubmit}>
            <Modal.Body className="py-3">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Họ và tên <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={addForm.fullName}
                      onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Tên đăng nhập <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="nguyenvana"
                      value={addForm.username}
                      onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Địa chỉ Email <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="user@example.com"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Số điện thoại</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="0987654321"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Vai trò</Form.Label>
                    <Form.Select
                      value={addForm.role}
                      onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    >
                      <option value="customer">Khách hàng (Customer)</option>
                      <option value="staff">Nhân viên (Staff)</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Trạng thái</Form.Label>
                    <Form.Select
                      value={addForm.status}
                      onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    >
                      <option value="active">Hoạt động (Active)</option>
                      <option value="inactive">Khóa (Inactive)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Địa chỉ</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Số nhà, đường, quận/huyện, tỉnh thành..."
                      value={addForm.address}
                      onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Mật khẩu khởi tạo <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showAddPassword ? 'text' : 'password'}
                        placeholder="Tối thiểu 6 ký tự"
                        value={addForm.password}
                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="light"
                        className="border"
                        onClick={() => setShowAddPassword(!showAddPassword)}
                      >
                        {showAddPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Xác nhận mật khẩu <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Nhập lại mật khẩu"
                      value={addForm.confirmPassword}
                      onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)}>
                Hủy
              </Button>
              <Button type="submit" className="btn-primary-orange px-4 rounded-pill" disabled={actionLoading}>
                {actionLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* MODAL 2: CHỈNH SỬA THÔNG TIN */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <FaEdit className="text-warning" /> Chỉnh sửa thông tin người dùng
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEditSubmit}>
            <Modal.Body className="py-3">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Họ và tên <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Tên đăng nhập <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Địa chỉ Email <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Số điện thoại</Form.Label>
                    <Form.Control
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Vai trò</Form.Label>
                    <Form.Select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      <option value="customer">Khách hàng (Customer)</option>
                      <option value="staff">Nhân viên (Staff)</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Trạng thái</Form.Label>
                    <Form.Select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="active">Hoạt động (Active)</option>
                      <option value="inactive">Khóa (Inactive)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Địa chỉ</Form.Label>
                    <Form.Control
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <Button variant="light" className="rounded-pill px-4" onClick={() => setShowEditModal(false)}>
                Hủy
              </Button>
              <Button type="submit" className="btn-primary-orange px-4 rounded-pill" disabled={actionLoading}>
                {actionLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* MODAL 3: ĐẶT LẠI MẬT KHẨU */}
        <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <FaKey className="text-warning" /> Cấp mật khẩu mới
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleResetSubmit}>
            <Modal.Body className="py-3">
              <p className="text-muted small mb-3">
                Đặt lại mật khẩu cho tài khoản:{' '}
                <strong className="text-dark">{resetTargetUser?.fullName}</strong> (@{resetTargetUser?.username})
              </p>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Mật khẩu mới</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showResetPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự"
                    value={resetPasswordForm.newPassword}
                    onChange={(e) =>
                      setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="light"
                    className="border"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                  >
                    {showResetPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group>
                <Form.Label className="fw-semibold small">Xác nhận mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={resetPasswordForm.confirmPassword}
                  onChange={(e) =>
                    setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <Button variant="light" className="rounded-pill px-4" onClick={() => setShowResetModal(false)}>
                Hủy
              </Button>
              <Button type="submit" className="btn-primary-orange px-4 rounded-pill" disabled={actionLoading}>
                {actionLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* MODAL 4: XÁC NHẬN XÓA TÀI KHOẢN */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold text-danger d-flex align-items-center gap-2">
              <FaExclamationTriangle /> Xác nhận xóa tài khoản
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-3">
            <p className="text-secondary mb-1">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của người dùng:
            </p>
            <div className="p-3 bg-light rounded-3 my-2">
              <div className="fw-bold text-dark">{deletingUser?.fullName}</div>
              <div className="small text-muted">@{deletingUser?.username} • {deletingUser?.email}</div>
            </div>
            <p className="small text-danger mb-0">
              ⚠️ Cảnh báo: Thao tác này sẽ xóa dữ liệu người dùng khỏi hệ thống và không thể hoàn tác!
            </p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowDeleteModal(false)}>
              Hủy
            </Button>
            <Button variant="danger" className="rounded-pill px-4" onClick={handleDeleteConfirm} disabled={actionLoading}>
              {actionLoading ? 'Đang xóa...' : 'Xóa tài khoản'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </main>
  );
};

export default UserManagementPage;
