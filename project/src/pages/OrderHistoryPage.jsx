import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { FaShoppingBag, FaSearch, FaLock, FaSignInAlt, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import '../styles/orderhistory.css';

const statusLabels = {
    pending: { label: 'Chờ xác nhận', badgeClass: 'bg-warning text-dark' },
    processing: { label: 'Đang xử lý', badgeClass: 'bg-info text-white' },
    shipping: { label: 'Đang giao', badgeClass: 'bg-primary text-white' },
    delivered: { label: 'Đã giao', badgeClass: 'bg-success text-white' },
    cancelled: { label: 'Đã hủy', badgeClass: 'bg-danger text-white' },
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

export default function OrderHistoryPage() {
    const { user, isStaffOrAdmin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        const loadOrders = async () => {
            // Nếu chưa đăng nhập thì không tải dữ liệu của hệ thống
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');

                const allOrders = await orderService.getAll();

                if (active) {
                    const list = Array.isArray(allOrders) ? allOrders : [];

                    // LỌC NGHIÊM NGẶT: Chỉ hiển thị đơn hàng thuộc về chính tài khoản này!
                    // Tránh việc khách hàng này xem được đơn hàng và thông tin cá nhân của khách hàng khác.
                    const userEmail = String(user.email || '').trim().toLowerCase();
                    const userPhone = String(user.phone || '').trim();
                    const userId = String(user.id || '').trim();

                    const myOrders = list.filter((order) => {
                        // Khớp theo ID tài khoản
                        if (order.userId && String(order.userId) === userId) {
                            return true;
                        }
                        // Khớp theo Email
                        if (userEmail && String(order.email || '').trim().toLowerCase() === userEmail) {
                            return true;
                        }
                        // Khớp theo Số điện thoại
                        if (userPhone && String(order.phone || '').trim() === userPhone) {
                            return true;
                        }
                        return false;
                    });

                    setOrders(myOrders);
                }
            } catch (err) {
                if (active) {
                    setError(err.message || 'Không thể tải lịch sử đơn hàng.');
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadOrders();

        return () => {
            active = false;
        };
    }, [user]);

    const filteredOrders = useMemo(() => {
        const search = keyword.trim().toLowerCase();

        return orders
            .filter((order) => {
                const matchesKeyword = [
                    order.id,
                    order.customerName,
                    order.phone,
                ].some((value) =>
                    String(value || '').toLowerCase().includes(search)
                );

                const matchesStatus =
                    statusFilter === 'all' ||
                    order.orderStatus === statusFilter;

                return matchesKeyword && matchesStatus;
            })
            .sort(
                (a, b) =>
                    new Date(b.orderDate || 0) - new Date(a.orderDate || 0)
            );
    }, [orders, keyword, statusFilter]);

    // Trường hợp chưa đăng nhập: Bảo vệ quyền riêng tư, không lộ danh sách
    if (!user) {
        return (
            <main className="container py-5">
                <div
                    className="bg-white rounded-4 shadow-sm p-5 text-center mx-auto"
                    style={{ maxWidth: 540 }}
                >
                    <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                            width: 80,
                            height: 80,
                            background: 'var(--primary-light, #fff4e6)',
                            color: 'var(--primary-color, #ff7a00)'
                        }}
                    >
                        <FaLock size={36} />
                    </div>
                    <h3 className="fw-bold mb-2">Yêu cầu đăng nhập</h3>
                    <p className="text-muted mb-4">
                        Vui lòng đăng nhập tài khoản của bạn để tra cứu và theo dõi các đơn hàng đã đặt.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Button
                            as={Link}
                            to="/login"
                            className="btn-primary-orange px-4 py-2 rounded-pill fw-bold"
                        >
                            <FaSignInAlt className="me-2" /> Đăng nhập ngay
                        </Button>
                        <Button
                            as={Link}
                            to="/"
                            variant="outline-secondary"
                            className="px-4 py-2 rounded-pill fw-semibold"
                        >
                            Về trang chủ
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="order-history-page py-4">
            <div className="container">
                {/* Banner dành riêng cho Admin/Staff khi vào trang này */}
                {isStaffOrAdmin && (
                    <Alert variant="warning" className="order-history-staff-alert d-flex align-items-center justify-content-between rounded-4 shadow-sm mb-4">
                        <div className="d-flex align-items-center gap-2">
                            <FaShieldAlt className="text-primary fs-5" />
                            <div>
                                <strong>Bạn đang đăng nhập với vai trò {user.role === 'admin' ? 'Quản trị viên (Admin)' : 'Nhân viên (Staff)'}.</strong>
                                <div className="small text-muted">
                                    Đây là trang hiển thị đơn hàng cá nhân của bạn. Để xem và xử lý toàn bộ đơn hàng của khách hàng, hãy chuyển đến trang Quản lý đơn hàng.
                                </div>
                            </div>
                        </div>
                        <Button
                            as={Link}
                            to="/admin/orders"
                            variant="primary"
                            size="sm"
                            className="rounded-pill px-3 fw-bold flex-shrink-0"
                        >
                            Trang quản lý đơn hàng
                        </Button>
                    </Alert>
                )}

                <div className="order-history-heading d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                    <h1 className="h3 fw-bold mb-1">Lịch sử đơn hàng của tôi</h1>
                    <p className="text-muted mb-0">
                        Chào <strong>{user.fullName || user.username}</strong>, theo dõi tình trạng và xem chi tiết các đơn hàng bạn đã đặt.
                    </p>
                </div>

                <div className="order-history-table table-responsive bg-white rounded-4 shadow-sm border px-4 py-3 mb-4">
                    <div className="col-md-8 px-4 py-3">
                        <label htmlFor="order-search" className="form-label fw-semibold text-secondary">
                            Tìm kiếm đơn hàng
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <FaSearch className="text-muted" />
                            </span>
                            <input
                                id="order-search"
                                className="form-control"
                                type="search"
                                placeholder="Nhập mã đơn hàng..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-md-4 px-4 py-3">
                        <label htmlFor="order-status" className="form-label fw-semibold text-secondary">
                            Lọc theo trạng thái
                        </label>
                        <select
                            id="order-status"
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            {Object.entries(statusLabels).map(([value, item]) => (
                                <option key={value} value={value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-5" role="status">
                        <Spinner animation="border" variant="warning" />
                        <p className="mt-2 text-muted">Đang tải đơn hàng của bạn...</p>
                    </div>
                )}

                {!loading && error && (
                    <Alert variant="danger" className="rounded-4">
                        {error}
                        <button
                            className="btn btn-sm btn-outline-danger ms-3 rounded-pill"
                            onClick={() => window.location.reload()}
                        >
                            Thử lại
                        </button>
                    </Alert>
                )}

                {!loading && !error && filteredOrders.length === 0 && (
                    <div className="text-center bg-white rounded-4 shadow-sm p-5 border">
                        <div
                            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                                width: 70,
                                height: 70,
                                background: '#f8fafc',
                                color: '#94a3b8'
                            }}
                        >
                            <FaShoppingBag size={32} />
                        </div>
                        <h2 className="h5 fw-bold">Chưa có đơn hàng nào</h2>
                        <p className="text-muted mb-4" style={{ maxWidth: 420, margin: '0 auto' }}>
                            {keyword || statusFilter !== 'all'
                                ? 'Không tìm thấy đơn hàng nào phù hợp với bộ lọc tìm kiếm.'
                                : 'Bạn chưa đặt đơn hàng nào tại PET SHOP. Hãy khám phá ngay các bé thú cưng và phụ kiện cao cấp nhé!'}
                        </p>
                        <Button as={Link} to="/" className="btn-primary-orange px-4 py-2 rounded-pill fw-bold">
                            Khám phá sản phẩm ngay
                        </Button>
                    </div>
                )}

                {!loading && !error && filteredOrders.length > 0 && (
                    <div className="table-responsive bg-white rounded-4 shadow-sm border px-3 py-3">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Mã đơn</th>
                                    <th>Ngày đặt</th>
                                    <th>Sản phẩm</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th className="text-end pe-4">Hành động</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredOrders.map((order) => {
                                    const statusConfig = statusLabels[order.orderStatus] || {
                                        label: order.orderStatus || 'Chưa xác định',
                                        badgeClass: 'bg-secondary text-white'
                                    };

                                    const itemCount = Array.isArray(order.items)
                                        ? order.items.reduce((s, it) => s + Number(it.quantity || 1), 0)
                                        : 1;

                                    return (
                                        <tr key={order.id}>
                                            <td className="ps-4 fw-bold text-dark">
                                                #{order.id}
                                            </td>
                                            <td className="text-muted">
                                                {order.orderDate
                                                    ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                                                    : '—'}
                                            </td>
                                            <td className="text-truncate" style={{ maxWidth: 250 }}>
                                                <span className="mb-2 p-2 badge bg-light text-dark border me-3 align-middle fw-semibold">
                                                    {itemCount} món
                                                </span>
                                                <small className="mt-3 mb-0 p-2text-muted text-truncate d-inline-block" style={{ maxWidth: 220 }}>
                                                    {order.items?.[0]?.name || 'Chi tiết đơn'}
                                                    {order.items?.length > 1 ? ` (+${order.items.length - 1})` : ''}
                                                </small>
                                            </td>
                                            <td className="fw-bold text-danger text-nowrap">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 py-2 fw-bold ${statusConfig.badgeClass}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <Link
                                                    to={`/orders/${encodeURIComponent(order.id)}`}
                                                    className="btn btn-sm btn-outline-warning rounded-pill px-3 fw-bold"
                                                >
                                                    Chi tiết <FaArrowRight size={11} className="ms-1" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !error && filteredOrders.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mt-3 text-muted small">
                        <span>
                            Hiển thị <strong>{filteredOrders.length}</strong> đơn hàng của bạn.
                        </span>
                    </div>
                )}
            </div>
        </main>
    );
}