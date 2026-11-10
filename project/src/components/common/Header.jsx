import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
    Navbar,
    Container,
    Nav,
    Dropdown,
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
    FaSignInAlt,
    FaSignOutAlt,
    FaClipboardList,
    FaInfoCircle,
    FaShoppingBag,
    FaUserCircle,
    FaThList,
    FaUsers,
    FaUserPlus,
    FaLock
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import SearchOverlay from './SearchOverlay';

const ROLE_LABELS = {
    admin: 'Quản trị viên (Admin)',
    staff: 'Nhân viên (Staff)',
    customer: 'Khách hàng'
};

const Header = ({ cartCount = 0, onSearch }) => {
    const navigate = useNavigate();
    const { user, isStaffOrAdmin, logout } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isStaff = user?.role === 'staff';

    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [noticeMessage, setNoticeMessage] = useState({
        title: '',
        content: ''
    });
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

        window.addEventListener('scroll', handleScroll, {
            passive: true
        });
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

        setShowSearch(false);

        if (window.location.pathname !== '/search') {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
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
                                <span>Cần Thơ</span>
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

            {/* Main Navbar */}
            <Navbar expand="lg" className="header-sticky">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="brand-logo">
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

                    <Navbar.Toggle aria-controls="main-navbar-nav" />

                    <Navbar.Collapse id="main-navbar-nav">
                        <Nav className="mx-auto my-2 my-lg-0">
                            <Nav.Link
                                as={Link}
                                to="/"
                                className={`nav-link-custom ${activeSection === 'home' ? 'active' : ''}`}
                            >
                                Trang Chủ
                            </Nav.Link>

                            <Nav.Link href="/#categories" className="nav-link-custom">
                                Danh Mục
                            </Nav.Link>

                            <Nav.Link href="/#featured-pets" className="nav-link-custom">
                                Thú Cưng
                            </Nav.Link>

                            <Nav.Link href="/#popular-breeds" className="nav-link-custom">
                                Yêu Thích
                            </Nav.Link>

                            <Nav.Link href="/#accessories-section" className="nav-link-custom">
                                Tiện Ích
                            </Nav.Link>

                            <Nav.Link href="/#shopping-process" className="nav-link-custom">
                                Quy Trình
                            </Nav.Link>

                            {/* Phân định chức năng trên Navbar giữa Admin và Staff */}
                            {isAdmin && (
                                <>
                                    <Nav.Link
                                        as={Link}
                                        to="/admin/users"
                                        className="nav-link-custom fw-bold text-danger"
                                    >
                                        Quản lý người dùng
                                    </Nav.Link>
                                    <Nav.Link
                                        as={Link}
                                        to="/admin/categories"
                                        className="nav-link-custom fw-bold text-danger"
                                    >
                                        Quản lý danh mục
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        to="/admin/orders"
                                        className="nav-link-custom fw-bold text-danger"
                                    >
                                        Quản lý đơn hàng (Admin)
                                    </Nav.Link>
                                </>
                            )}

                            {isStaff && (
                                <>
                                    <Nav.Link
                                        as={Link}
                                        to="/admin/categories"
                                        className="nav-link-custom text-primary"
                                    >
                                        Danh mục sản phẩm
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        to="/admin/orders"
                                        className="nav-link-custom text-primary"
                                    >
                                        Xử lý đơn hàng (Staff)
                                    </Nav.Link>
                                </>
                            )}

                            {/* Khách hàng thường xem đơn cá nhân */}
                            {(!isStaffOrAdmin || user?.role === 'customer') && (
                                <Nav.Link
                                    as={Link}
                                    to="/orders"
                                    className="nav-link-custom"
                                >
                                    Lịch sử đơn hàng
                                </Nav.Link>
                            )}
                        </Nav>

                        <div className="d-flex align-items-center gap-3">
                            <button
                                type="button"
                                className="search-trigger"
                                onClick={() => setShowSearch(true)}
                                aria-label="Mở hộp tìm kiếm"
                            >
                                <span className="search-trigger-text">
                                    Tìm cún cưng, mèo, phụ kiện...
                                </span>
                                <FaSearch className="search-trigger-icon" />
                            </button>

                            {/* User Account Dropdown */}
                            {user ? (
                                <Dropdown align="end">
                                    <Dropdown.Toggle
                                        as="button"
                                        type="button"
                                        id="user-menu-toggle"
                                        className="user-icon-btn user-avatar-btn p-0 overflow-hidden"
                                        title={user.fullName}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `2px solid ${isAdmin ? '#ef4444' : isStaff ? '#3b82f6' : 'var(--primary-color, #ff7a00)'}`
                                        }}
                                    >
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.fullName}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <span
                                            style={{
                                                display: user.avatar ? 'none' : 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '100%',
                                                height: '100%',
                                                background: 'var(--primary-light, #fff4e6)',
                                                color: 'var(--primary-color, #ff7a00)'
                                            }}
                                        >
                                            <FaUserAlt size={16} />
                                        </span>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="user-menu shadow">
                                        <div className="user-menu-header">
                                            <div className="fw-bold text-truncate">
                                                {user.fullName}
                                            </div>

                                            <small className="text-muted d-block text-truncate">
                                                {user.email}
                                            </small>

                                            <span className={`user-role-badge ${isAdmin ? 'bg-danger text-white' : isStaff ? 'bg-primary text-white' : ''}`}>
                                                {ROLE_LABELS[user.role] || user.role}
                                            </span>
                                        </div>

                                        <Dropdown.Divider />

                                        {/* Link Hồ sơ cá nhân */}
                                        <Dropdown.Item
                                            as={Link}
                                            to="/profile"
                                            className="fw-semibold"
                                        >
                                            <FaUserCircle className="me-2 text-warning" />
                                            Hồ sơ cá nhân
                                        </Dropdown.Item>

                                        <Dropdown.Item
                                            as={Link}
                                            to="/change-password"
                                        >
                                            <FaLock className="me-2 text-warning" />
                                            Đổi mật khẩu
                                        </Dropdown.Item>

                                        {/* Phân quyền menu riêng biệt theo vai trò */}
                                        {isAdmin && (
                                            <>
                                                <Dropdown.Item
                                                    as={Link}
                                                    to="/admin/users"
                                                >
                                                    <FaUsers className="me-2 text-danger" />
                                                    Quản lý người dùng
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    as={Link}
                                                    to="/admin/categories"
                                                >
                                                    <FaThList className="me-2 text-danger" />
                                                    Quản lý danh mục & SP
                                                </Dropdown.Item>

                                                <Dropdown.Item
                                                    as={Link}
                                                    to="/admin/orders"
                                                >
                                                    <FaClipboardList className="me-2 text-danger" />
                                                    Quản lý đơn hàng (Admin)
                                                </Dropdown.Item>
                                            </>
                                        )}

                                        {isStaff && (
                                            <>
                                                <Dropdown.Item
                                                    as={Link}
                                                    to="/admin/orders"
                                                >
                                                    <FaClipboardList className="me-2 text-primary" />
                                                    Xử lý đơn hàng (Staff)
                                                </Dropdown.Item>

                                                <Dropdown.Item
                                                    as={Link}
                                                    to="/admin/categories"
                                                >
                                                    <FaThList className="me-2 text-primary" />
                                                    Xem danh mục sản phẩm
                                                </Dropdown.Item>
                                            </>
                                        )}

                                        {/* Link Đơn hàng của tôi */}
                                        <Dropdown.Item
                                            as={Link}
                                            to="/orders"
                                        >
                                            <FaShoppingBag className="me-2 text-success" />
                                            {isStaffOrAdmin ? 'Đơn hàng cá nhân' : 'Lịch sử đơn hàng'}
                                        </Dropdown.Item>

                                        <Dropdown.Divider />

                                        <Dropdown.Item
                                            onClick={handleLogout}
                                            className="text-danger"
                                        >
                                            <FaSignOutAlt className="me-2" />
                                            Đăng xuất
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            ) : (
                                <div className="d-flex align-items-center gap-2">
                                    <Link
                                    to="/login"
                                    className="btn-primary-orange btn-login-header"
                                >
                                    <FaSignInAlt /> Đăng nhập
                                </Link>
                                    <Link
                                        to="/register"
                                        className="btn btn-outline-warning rounded-pill d-none d-md-inline-flex align-items-center gap-1 fw-bold px-3 py-2"
                                        style={{ borderColor: '#ff7a00', color: '#ff7a00', fontSize: '0.88rem' }}
                                    >
                                        <FaUserPlus /> Đăng ký
                                    </Link>
                                </div>
                            )}

                            {/* Shopping Cart */}
                            <button
                                className="cart-icon-btn"
                                onClick={() => navigate('/cart')}
                                title="Giỏ hàng"
                                type="button"
                            >
                                <FaShoppingCart />

                                {cartCount > 0 && (
                                    <span className="cart-badge-count">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Search Overlay */}
            <SearchOverlay
                show={showSearch}
                onClose={() => setShowSearch(false)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSubmit={handleSearchSubmit}
            />

            {/* Notice Modal */}
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
