
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import orderService from '../services/orderService';

const statusLabels = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
};

const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString('vi-VN') + ' ₫';

const formatDate = (date) => {
    if (!date) return 'Chưa có thông tin';

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
        ? 'Chưa có thông tin'
        : parsedDate.toLocaleString('vi-VN');
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                setError('');

                const data = await orderService.getById(id);
                setOrder(data);
            } catch (err) {
                setError(
                    err.message || 'Không thể tải thông tin đơn hàng.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id]);

    if (loading) {
        return (
            <main className="container py-5">
                <p>Đang tải thông tin đơn hàng...</p>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="container py-5">
                <div className="alert alert-danger">
                    {error || 'Không tìm thấy đơn hàng.'}
                </div>
                <Link to="/admin/orders" className="btn btn-secondary">
                    Quay lại danh sách
                </Link>
            </main>
        );
    }

    const items = Array.isArray(order.items)
        ? order.items
        : Array.isArray(order.orderItems)
            ? order.orderItems
            : [];

    return (
        <main className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Chi tiết đơn hàng</h1>
                <Link to="/admin/orders" className="btn btn-outline-secondary">
                    Quay lại danh sách
                </Link>
            </div>

            <div className="card mb-4">
                <div className="card-header fw-bold">
                    Thông tin đơn hàng
                </div>
                <div className="card-body">
                    <p><strong>Mã đơn:</strong> {order.id}</p>
                    <p><strong>Khách hàng:</strong> {order.customerName || 'Chưa có thông tin'}</p>
                    <p><strong>Số điện thoại:</strong> {order.phone || 'Chưa có thông tin'}</p>
                    <p>
                        <strong>Email:</strong> {order.email || 'Chưa có thông tin'}
                    </p>
                    <p>
                        <strong>Địa chỉ:</strong> {order.shippingAddress || 'Chưa có thông tin'}
                    </p>
                    <p>
                        <strong>Thanh toán:</strong> {order.paymentMethod || 'Chưa có thông tin'}
                    </p>
                    <p><strong>Ngày đặt:</strong> {formatDate(order.orderDate)}</p>
                    <p className="mb-0">
                        <strong>Trạng thái:</strong>{' '}
                        {statusLabels[order.orderStatus] || order.orderStatus || 'Chưa xác định'}
                    </p>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header fw-bold">
                    Sản phẩm trong đơn
                </div>
                <div className="card-body">
                    {items.length === 0 ? (
                        <p className="text-muted mb-0">
                            Đơn hàng chưa có thông tin sản phẩm chi tiết.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const quantity = Number(item.quantity || 1);
                                        const price = Number(item.price || item.unitPrice || 0);

                                        return (
                                            <tr key={item.id || index}>
                                                <td>{item.name || item.productName || 'Sản phẩm'}</td>
                                                <td>{quantity}</td>
                                                <td>{formatCurrency(price)}</td>
                                                <td>{formatCurrency(price * quantity)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <h5 className="text-end mt-3">
                        Tổng tiền: {formatCurrency(order.totalAmount)}
                    </h5>
                </div>
            </div>
        </main>
    );
}
