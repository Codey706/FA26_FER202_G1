import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';

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

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        const loadOrders = async () => {
            try {
                setLoading(true);
                setError('');

                const data = await orderService.getAll();

                if (active) {
                    setOrders(Array.isArray(data) ? data : []);
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
    }, []);

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

    return (
        <main className="container py-4">
            <div className="mb-4">
                <h1 className="h3 fw-bold">Lịch sử đơn hàng</h1>
                <p className="text-muted">
                    Theo dõi đơn hàng và xem thông tin mua hàng của bạn.
                </p>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-8">
                    <label htmlFor="order-search" className="form-label">
                        Tìm kiếm đơn hàng
                    </label>
                    <input
                        id="order-search"
                        className="form-control"
                        type="search"
                        placeholder="Nhập mã đơn hàng hoặc tên người nhận..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>

                <div className="col-md-4">
                    <label htmlFor="order-status" className="form-label">
                        Trạng thái
                    </label>
                    <select
                        id="order-status"
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
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

            {loading && (
                <div className="text-center py-5" role="status">
                    <div className="spinner-border text-primary" />
                    <p className="mt-2">Đang tải đơn hàng...</p>
                </div>
            )}

            {!loading && error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                    <button
                        className="btn btn-sm btn-outline-danger ms-3"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {!loading && !error && filteredOrders.length === 0 && (
                <div className="text-center border rounded p-5">
                    <h2 className="h5">Không tìm thấy đơn hàng</h2>
                    <p className="text-muted">
                        Hãy thử từ khóa khác hoặc thay đổi bộ lọc.
                    </p>
                    <Link to="/" className="btn btn-primary">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            )}

            {!loading && !error && filteredOrders.length > 0 && (
                <div className="table-responsive border rounded">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Mã đơn</th>
                                <th>Ngày đặt</th>
                                <th>Người nhận</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="fw-semibold">{order.id}</td>
                                    <td>
                                        {order.orderDate
                                            ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                                            : '—'}
                                    </td>
                                    <td>{order.customerName || '—'}</td>
                                    <td className="fw-semibold text-nowrap">
                                        {formatCurrency(order.totalAmount)}
                                    </td>
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
                                            {statusLabels[order.orderStatus] ||
                                                order.orderStatus ||
                                                'Chưa xác định'}
                                        </span>
                                    </td>
                                    <td>
                                        <Link
                                            to={`/orders/${encodeURIComponent(order.id)}`}
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && filteredOrders.length > 0 && (
                <p className="text-muted small mt-3">
                    Hiển thị {filteredOrders.length} đơn hàng.
                </p>
            )}
        </main>
    );
}