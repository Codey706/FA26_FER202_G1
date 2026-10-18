import React, { useState, useEffect } from 'react';
import {
  Navbar,
  Container,
  Nav,
  Form,
  Badge,
  Modal,
  Button
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
  FaInfoCircle
} from 'react-icons/fa';

const Header = ({ onSearch, cartCount = 3 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState({ title: '', content: '' });
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

  const handleCartClick = () => {
    setNoticeMessage({
      title: 'Giỏ hàng của bạn (3 món)',
      content:
        'Bạn đang có 3 sản phẩm trong giỏ hàng mẫu. Chức năng Quản lý giỏ hàng và Thanh toán (Checkout) sẽ được triển khai chi tiết ở giai đoạn tiếp theo!'
    });
    setShowNoticeModal(true);
  };

  const handleUserClick = () => {
    setNoticeMessage({
      title: 'Tài khoản người dùng',
      content:
        'Hệ thống Đăng nhập / Đăng ký và Quản lý tài khoản (User Management) sẽ được triển khai ở giai đoạn tiếp theo theo phân công thành viên nhóm.'
    });
    setShowNoticeModal(true);
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

              {/* User Account Button */}
              <button
                className="user-icon-btn"
                onClick={handleUserClick}
                title="Tài khoản người dùng"
                type="button"
              >
                <FaUserAlt />
              </button>

              {/* Shopping Cart Button with Badge */}
              <button
                className="cart-icon-btn"
                onClick={handleCartClick}
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

      {/* Notice Modal for Non-Phase 1 Features */}
      <Modal
        show={showNoticeModal}
        onHide={() => setShowNoticeModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2 text-primary">
            <FaInfoCircle className="text-warning" />
            {noticeMessage.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3 text-secondary">
          <p className="mb-0">{noticeMessage.content}</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="warning"
            className="fw-bold text-white px-4"
            style={{ borderRadius: '50px' }}
            onClick={() => setShowNoticeModal(false)}
          >
            Đã hiểu
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Header;
