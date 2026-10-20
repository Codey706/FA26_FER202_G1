
import { useEffect, useMemo, useState } from 'react';
import orderService from '../services/orderService';
import { Link } from 'react-router-dom';

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
    const [orders, setOrders] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
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

    const handleStatusChange = async (order, newStatus) => {
        if (!newStatus || newStatus === order.orderStatus) return;

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

    return (
        <main className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h1 className="h3 mb-1">Quản lý đơn hàng</h1>
                    <p className="text-muted mb-0">
                        Xem và cập nhật trạng thái đơn hàng.
                    </p>
                </div>

                <span className="badge text-bg-primary fs-6">
                    {filteredOrders.length} đơn hàng
                </span>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-8">
                    <label htmlFor="order-search" className="form-label">
                        Tìm kiếm
                    </label>

                    <input
                        id="order-search"
                        className="form-control"
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="Mã đơn, tên khách hàng hoặc số điện thoại"
                    />
                </div>

                <div className="col-md-4">
                    <label htmlFor="order-status-filter" className="form-label">
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
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2 mb-0">Đang tải đơn hàng...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="alert alert-info">
                    Không tìm thấy đơn hàng phù hợp.
                </div>
            ) : (
                <div className="table-responsive border rounded">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Cập nhật trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    {/* Cot Ma don */}
                                    <td className="text-nowrap">
                                        {order.id}
                                    </td>

                                    <td>
                                        <div>{order.customerName || 'Chưa có tên'}</div>
                                        <small className="text-nowrap">
                                            {order.phone || 'Chưa có số điện thoại'}
                                        </small>
                                    </td>

                                    <td>{formatDate(order.orderDate)}</td>

                                    <td className="text-nowrap">
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
                                        <select
                                            className="form-select form-select-sm"
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

                                            {Object.entries(statusLabels).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>

                                        {updatingId === order.id && (
                                            <small className="text-muted">Đang lưu...</small>
                                        )}
                                    </td>
                                    <td>
                                        <Link
                                            to={`/admin/orders/${order.id}`}
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
        </main>
    );
}
