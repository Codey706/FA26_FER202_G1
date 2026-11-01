import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaTrash, FaShieldAlt, FaLock, FaSearch, FaArrowRight } from 'react-icons/fa';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const statusLabels = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

const formatDate = (date) => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
        ? '—'
        : parsedDate.toLocaleDateString('vi-VN');
};

export default function OrderManagementPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [orders, setOrders] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    // Modal xóa đơn dành riêng cho Admin
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingOrder, setDeletingOrder] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await orderService.getAll();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesKeyword = [
                order.id,
                order.customerName,
                order.phone,
            ].some((value) =>
                String(value || '').toLowerCase().includes(normalizedKeyword)
            );

            const matchesStatus =
                statusFilter === 'all' ||
                order.orderStatus === statusFilter;

            return matchesKeyword && matchesStatus;
        });
    }, [orders, keyword, statusFilter]);

    // Xử lý đổi trạng thái với phân quyền nghiêm ngặt
    const handleStatusChange = async (order, newStatus) => {
        if (!newStatus || newStatus === order.orderStatus) return;

        // PHÂN QUYỀN: Nhân viên không được tự ý hủy đơn hàng
        if (!isAdmin && newStatus === 'cancelled') {
            setError('Thao tác bị từ chối: Nhân viên không có quyền Hủy đơn hàng. Vui lòng liên hệ Quản trị viên (Admin).');
            return;
        }

        try {
            setUpdatingId(order.id);
            setError('');

            const updatedOrder = await orderService.updateStatus(
                order.id,
                newStatus
            );

            setOrders((currentOrders) =>
                currentOrders.map((item) =>
                    item.id === order.id
                        ? { ...item, ...updatedOrder }
                        : item
                )
            );
        } catch (err) {
            setError(err.message || 'Không thể cập nhật trạng thái đơn hàng.');
        } finally {
            setUpdatingId(null);
        }
    };

    // Mở modal xác nhận xóa đơn (Chỉ Admin)
    const handleOpenDelete = (order) => {
        if (!isAdmin) {
            setError('Chỉ Quản trị viên (Admin) mới có quyền xóa đơn hàng.');
            return;
        }
        setDeletingOrder(order);
        setShowDeleteModal(true);
    };

    // Xác nhận xóa đơn hàng (Chỉ Admin)
    const confirmDelete = async () => {
        if (!deletingOrder) return;
        if (!isAdmin) {
            setError('Thao tác bị từ chối: Chỉ Quản trị viên mới được xóa đơn hàng.');
            setShowDeleteModal(false);
            return;
        }

        try {
            setIsDeleting(true);
            await orderService.delete(deletingOrder.id);

            setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id));
            setShowDeleteModal(false);
            setDeletingOrder(null);
        } catch (err) {
            setError(err.message || 'Xóa đơn hàng thất bại. Vui lòng thử lại.');
            await loadOrders();
            setShowDeleteModal(false);
            setDeletingOrder(null);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <main className="container py-4">
            {/* Header & Phân quyền vai trò */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <div className="mb-2">
                        <Badge
                            bg={isAdmin ? 'danger' : 'primary'}
                            className="px-3 py-2 rounded-pill fw-bold"
                        >
                            <FaShieldAlt className="me-1" />
                            {isAdmin ? 'QUẢN TRỊ VIÊN (ADMIN)' : 'NHÂN VIÊN BÁN HÀNG (STAFF)'}
                        </Badge>
                    </div>

                    <h1 className="h3 mb-1 fw-bold">Quản lý đơn hàng toàn hệ thống</h1>
                    <p className="text-muted mb-0">
                        {isAdmin
                            ? 'Bạn có toàn quyền: Cập nhật trạng thái, Hủy đơn hàng và Xóa các đơn rác/thử nghiệm.'
                            : 'Nhân viên: Tiếp nhận, duyệt đơn và cập nhật tiến độ giao hàng cho khách hàng.'}
                    </p>
                </div>

                <span className="badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-2 rounded-pill fs-6 fw-bold">
                    Tổng cộng: {filteredOrders.length} đơn hàng
                </span>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-8">
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
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder="Nhập mã đơn, tên khách hàng hoặc số điện thoại..."
                        />
                    </div>
                </div>

                <div className="col-md-4">
                    <label htmlFor="order-status-filter" className="form-label fw-semibold text-secondary">
                        Lọc theo trạng thái
                    </label>

                    <select
                        id="order-status-filter"
                        className="form-select"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>

                        {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setError('')}
                    className="rounded-4 shadow-sm mb-4"
                >
                    {error}
                </Alert>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="warning" />
                    <p className="mt-2 mb-0 text-muted">Đang tải danh sách đơn hàng...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="alert alert-info rounded-4 text-center py-4">
                    Không tìm thấy đơn hàng phù hợp với bộ lọc tìm kiếm.
                </div>
            ) : (
                <div className="table-responsive bg-white rounded-4 shadow-sm border">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Cập nhật tiến độ</th>
                                <th className="text-end pe-4">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    {/* Mã đơn */}
                                    <td className="ps-4 text-nowrap fw-bold text-dark">
                                        #{order.id}
                                    </td>

                                    {/* Khách hàng (Đã sửa lỗi lặp cột mã đơn) */}
                                    <td>
                                        <div className="fw-semibold text-dark">
                                            {order.customerName || 'Chưa có tên'}
                                        </div>
                                        <small className="text-muted">
                                            {order.phone || 'Chưa có SĐT'}
                                        </small>
                                    </td>

                                    {/* Ngày đặt */}
                                    <td className="text-muted">{formatDate(order.orderDate)}</td>

                                    {/* Tổng tiền */}
                                    <td className="text-nowrap fw-bold text-danger">
                                        {formatCurrency(order.totalAmount)}
                                    </td>

                                    {/* Trạng thái */}
                                    <td>
                                        <span
                                            className={`badge ${{
                                                    pending: 'status-pending',
                                                    processing: 'status-processing',
                                                    shipping: 'status-shipping',
                                                    delivered: 'status-delivered',
                                                    cancelled: 'status-cancelled',
                                                }[order.orderStatus] || 'status-default'
                                                }`}
                                        >
                                            {statusLabels[order.orderStatus] || order.orderStatus}
                                        </span>
                                    </td>

                                    {/* Cập nhật trạng thái có phân quyền Staff vs Admin */}
                                    <td style={{ minWidth: 180 }}>
                                        <select
                                            className="form-select form-select-sm rounded-pill"
                                            aria-label={`Cập nhật trạng thái ${order.id}`}
                                            value={order.orderStatus || ''}
                                            disabled={updatingId === order.id}
                                            onChange={(event) =>
                                                handleStatusChange(order, event.target.value)
                                            }
                                        >
                                            {!statusLabels[order.orderStatus] && (
                                                <option value={order.orderStatus || ''}>
                                                    {order.orderStatus || 'Chưa xác định'}
                                                </option>
                                            )}

                                            <option value="pending">Chờ xác nhận</option>
                                            <option value="processing">Đang xử lý</option>
                                            <option value="shipping">Đang giao</option>
                                            <option value="delivered">Đã giao</option>

                                            {/* Hủy đơn: Staff bị vô hiệu hóa */}
                                            <option
                                                value="cancelled"
                                                disabled={!isAdmin}
                                            >
                                                {isAdmin ? 'Đã hủy' : 'Đã hủy (Chỉ Admin)'}
                                            </option>
                                        </select>

                                        {updatingId === order.id && (
                                            <small className="text-muted d-block mt-1">Đang lưu...</small>
                                        )}
                                    </td>

                                    {/* Thao tác */}
                                    <td className="text-end pe-4">
                                        <div className="d-flex align-items-center justify-content-end gap-2">
                                            <Link
                                                to={`/admin/orders/${order.id}`}
                                                className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold"
                                            >
                                                Chi tiết
                                            </Link>

                                            {/* Nút Xóa đơn hàng chỉ dành cho Admin */}
                                            {isAdmin ? (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="rounded-circle"
                                                    style={{ width: 32, height: 32, padding: 0 }}
                                                    onClick={() => handleOpenDelete(order)}
                                                    title="Xóa đơn hàng rác / thử nghiệm"
                                                >
                                                    <FaTrash size={12} />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal xác nhận xóa đơn hàng dành riêng cho Admin */}
            <Modal
                show={showDeleteModal}
                onHide={() => !isDeleting && setShowDeleteModal(false)}
                centered
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-danger d-flex align-items-center gap-2">
                        <FaTrash /> Xác nhận xóa đơn hàng (Admin)
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="py-3">
                    Bạn có chắc chắn muốn xóa đơn hàng <strong>#{deletingOrder?.id}</strong> của khách hàng <strong>{deletingOrder?.customerName}</strong> không?
                    <p className="text-danger small mt-2 mb-0">
                        Lưu ý: Chỉ Quản trị viên mới được quyền xóa đơn hàng này. Dữ liệu sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.
                    </p>
                </Modal.Body>

                <Modal.Footer className="border-0 pt-0">
                    <Button
                        variant="light"
                        className="rounded-pill px-4"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                    >
                        Hủy
                    </Button>

                    <Button
                        variant="danger"
                        className="rounded-pill px-4 fw-bold"
                        onClick={confirmDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}
