import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  Navbar,
  Container,
  Nav,
  Form,
  Dropdown
} from 'react-bootstrap';
import {
  FaPaw,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaSearch,
  FaShoppingCart,
  FaUserAlt,
  FaShieldAlt,
  FaSignInAlt,
  FaSignOutAlt,
  FaClipboardList
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Quản trị viên',
  staff: 'Nhân viên',
  customer: 'Khách hàng'
};

const Header = ({ onSearch, cartCount = 0 }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isStaffOrAdmin, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sectionIds = [
      'home',
      'categories',
      'featured-pets',
      'popular-breeds',
      'accessories-section',
      'shopping-process',
      'testimonials'
    ];

    const handleScroll = () => {
      const marker = 160;
      let currentSection = 'home';
      let closestTop = -Infinity;

      sectionIds.forEach((id) => {
        const section = document.getElementById(id);

        if (!section) return;

        const top = section.getBoundingClientRect().top;

        if (top <= marker && top > closestTop) {
          closestTop = top;
          currentSection = id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
    // Scroll to products section if searching
    const target = document.getElementById('featured-pets');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <Container>
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <div className="d-flex flex-wrap align-items-center gap-3">
              <span className="top-bar-item">
                <FaPhoneAlt className="text-warning" />
                <span>
                  Hotline tư vấn: <strong>0987.654.321</strong> (24/7)
                </span>
              </span>
              <span className="top-bar-item d-none d-md-inline-flex">
                <FaMapMarkerAlt className="text-warning" />
                <span>Hà Nội - TP. Hồ Chí Minh - Đà Nẵng</span>
              </span>
              <span className="top-bar-item d-none d-lg-inline-flex">
                <FaClock className="text-warning" />
                <span>Mở cửa: 08:00 - 21:30</span>
              </span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="top-bar-item">
                <FaShieldAlt className="text-success" />
                <span>Cam kết 100% Thuần chủng</span>
              </span>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Header / Navbar */}
      <Navbar expand="lg" className="header-sticky">
        <Container>
          {/* Brand Logo */}
          <Navbar.Brand href="#home" className="brand-logo">
            <div className="brand-icon-box">
              <FaPaw />
            </div>
            <div>
              <div className="d-flex align-items-center gap-1">
                <span>PET</span>
                <span className="text-dark">SHOP</span>
              </div>
              <small
                style={{
                  fontSize: '0.65rem',
                  color: '#64748b',
                  display: 'block',
                  fontWeight: 600,
                  marginTop: '-4px',
                  letterSpacing: '0.5px'
                }}
              >
                THÚ CƯNG & PHỤ KIỆN CAO CẤP
              </small>
            </div>
          </Navbar.Brand>

          {/* Mobile Hamburger Toggle */}
          <Navbar.Toggle aria-controls="main-navbar-nav" />

          <Navbar.Collapse id="main-navbar-nav">
            {/* Navigation Links */}
            <Nav className="mx-auto my-2 my-lg-0">

              <Nav.Link
                href="#home"
                className={`nav-link-custom ${activeSection === 'home' ? 'active' : ''}`}
              >
                Trang Chủ
              </Nav.Link>

              <Nav.Link
                href="#categories"
                className={`nav-link-custom ${activeSection === 'categories' ? 'active' : ''}`}
              >
                Danh Mục
              </Nav.Link>

              <Nav.Link
                href="#featured-pets"
                className={`nav-link-custom ${activeSection === 'featured-pets' ? 'active' : ''}`}
              >
                Thú Cưng
              </Nav.Link>

              <Nav.Link
                href="#popular-breeds"
                className={`nav-link-custom ${activeSection === 'popular-breeds' ? 'active' : ''}`}
              >
                Yêu Thích
              </Nav.Link>

              <Nav.Link
                href="#accessories-section"
                className={`nav-link-custom ${activeSection === 'accessories-section' ? 'active' : ''}`}
              >
                Tiện Ích
              </Nav.Link>

              <Nav.Link
                href="#shopping-process"
                className={`nav-link-custom ${activeSection === 'shopping-process' ? 'active' : ''}`}
              >
                Quy Trình
              </Nav.Link>

              <Nav.Link
                href="#testimonials"
                className={`nav-link-custom ${activeSection === 'testimonials' ? 'active' : ''}`}
              >
                Đánh Giá
              </Nav.Link>
              {isStaffOrAdmin && (
                <Nav.Link
                  as={Link}
                  to="/admin/orders"
                  className="nav-link-custom"
                >
                  Quản Lý Đơn Hàng
                </Nav.Link>
              )}
            </Nav>

            {/* Search Box & Quick Actions */}
            <div className="d-flex align-items-center gap-3">
              <Form className="search-form-box" onSubmit={handleSearchSubmit}>
                <Form.Control
                  type="text"
                  placeholder="Tìm cún cưng, mèo, phụ kiện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-custom"
                />
                <button
                  type="submit"
                  className="search-btn-icon"
                  title="Tìm kiếm"
                >
                  <FaSearch />
                </button>
              </Form>

              {/* User Account: nút Đăng nhập hoặc menu tài khoản */}
              {user ? (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as="button"
                    type="button"
                    id="user-menu-toggle"
                    className="user-icon-btn user-avatar-btn"
                    title={user.fullName}
                  >
                    <FaUserAlt />
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="user-menu shadow">
                    <div className="user-menu-header">
                      <div className="fw-bold text-truncate">{user.fullName}</div>
                      <small className="text-muted d-block text-truncate">{user.email}</small>
                      <span className="user-role-badge">
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </div>
                    <Dropdown.Divider />
                    {isStaffOrAdmin && (
                      <Dropdown.Item as={Link} to="/admin/orders">
                        <FaClipboardList className="me-2 text-warning" /> Quản lý đơn hàng
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      <FaSignOutAlt className="me-2" /> Đăng xuất
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Link to="/login" className="btn-primary-orange btn-login-header">
                  <FaSignInAlt /> Đăng nhập
                </Link>
              )}

              {/* Shopping Cart Button with Badge */}
              <button
                className="cart-icon-btn"
                onClick={() => navigate('/cart')}
                title="Giỏ hàng"
                type="button"
              >
                <FaShoppingCart />
                <span className="cart-badge-count">{cartCount}</span>
              </button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;