import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Alert, Button, Spinner, Table } from 'react-bootstrap';
import { FaArrowLeft, FaShieldAlt, FaLock, FaUserAlt, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaCalendarAlt, FaCreditCard } from 'react-icons/fa';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const statusLabels = {
    pending: { label: 'Chờ xác nhận', badgeClass: 'bg-warning text-dark' },
    processing: { label: 'Đang xử lý', badgeClass: 'bg-info text-white' },
    shipping: { label: 'Đang giao hàng', badgeClass: 'bg-primary text-white' },
    delivered: { label: 'Đã giao hàng', badgeClass: 'bg-success text-white' },
    cancelled: { label: 'Đã hủy', badgeClass: 'bg-danger text-white' },
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
    const navigate = useNavigate();
    const { user, isStaffOrAdmin } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [forbidden, setForbidden] = useState(false);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                setError('');
                setForbidden(false);

                const data = await orderService.getById(id);

                if (!data) {
                    setError('Không tìm thấy thông tin đơn hàng này.');
                    return;
                }

                // KIỂM TRA PHÂN QUYỀN BẢO MẬT:
                // Nếu người xem là customer, kiểm tra xem đơn hàng này có đúng là của họ không
                if (user && user.role === 'customer') {
                    const isOwnOrder =
                        (data.userId && String(data.userId) === String(user.id)) ||
                        (data.email && user.email && data.email.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
                        (data.phone && user.phone && data.phone.trim() === user.phone.trim());

                    if (!isOwnOrder) {
                        setForbidden(true);
                        setOrder(null);
                        return;
                    }
                }

                setOrder(data);
            } catch (err) {
                setError(err.message || 'Không thể tải thông tin đơn hàng.');
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id, user]);

    const backUrl = isStaffOrAdmin ? '/admin/orders' : '/orders';

    if (loading) {
        return (
            <main className="container py-5 text-center">
                <Spinner animation="border" variant="warning" />
                <p className="mt-3 text-muted">Đang tải chi tiết đơn hàng...</p>
            </main>
        );
    }

    if (forbidden) {
        return (
            <main className="container py-5">
                <div className="bg-white rounded-4 shadow-sm p-5 text-center mx-auto" style={{ maxWidth: 540 }}>
                    <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: 80, height: 80, background: '#fee2e2', color: '#dc2626' }}
                    >
                        <FaLock size={36} />
                    </div>
                    <h3 className="fw-bold mb-2 text-danger">Không có quyền truy cập</h3>
                    <p className="text-muted mb-4">
                        Đơn hàng <strong>#{id}</strong> không thuộc quyền sở hữu của tài khoản bạn. Bạn không thể xem thông tin đơn hàng của khách hàng khác.
                    </p>
                    <Button as={Link} to={backUrl} variant="outline-dark" className="rounded-pill px-4 fw-bold">
                        <FaArrowLeft className="me-2" /> Về đơn hàng của tôi
                    </Button>
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="container py-5">
                <Alert variant="danger" className="rounded-4 p-4 text-center">
                    <h5>{error || 'Không tìm thấy đơn hàng.'}</h5>
                    <Button as={Link} to={backUrl} variant="outline-danger" className="rounded-pill mt-2">
                        <FaArrowLeft className="me-2" /> Quay lại danh sách
                    </Button>
                </Alert>
            </main>
        );
    }

    const items = Array.isArray(order.items)
        ? order.items
        : Array.isArray(order.orderItems)
            ? order.orderItems
            : [];

    const statusConfig = statusLabels[order.orderStatus] || {
        label: order.orderStatus || 'Chưa xác định',
        badgeClass: 'bg-secondary text-white'
    };

    return (
        <main className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <Link to={backUrl} className="text-muted text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1 mb-2">
                        <FaArrowLeft size={12} /> {isStaffOrAdmin ? 'Quay lại Quản lý đơn' : 'Quay lại Đơn hàng của tôi'}
                    </Link>
                    <h1 className="h3 fw-bold mb-0">Chi tiết đơn hàng #{order.id}</h1>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Trạng thái:</span>
                    <Badge className={`px-3 py-2 rounded-pill fs-6 fw-bold ${statusConfig.badgeClass}`}>
                        {statusConfig.label}
                    </Badge>
                </div>
            </div>

            <Row className="g-4">
                {/* Thông tin đơn hàng & khách hàng */}
                <Col lg={4}>
                    <Card className="rounded-4 border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white fw-bold py-3 border-bottom">
                            Thông tin người nhận
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <FaUserAlt className="text-warning flex-shrink-0" />
                                <div>
                                    <small className="text-muted d-block">Họ và tên:</small>
                                    <strong>{order.customerName || 'Chưa có thông tin'}</strong>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2 mb-3">
                                <FaPhoneAlt className="text-warning flex-shrink-0" />
                                <div>
                                    <small className="text-muted d-block">Số điện thoại:</small>
                                    <strong>{order.phone || 'Chưa có thông tin'}</strong>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2 mb-3">
                                <FaEnvelope className="text-warning flex-shrink-0" />
                                <div>
                                    <small className="text-muted d-block">Email:</small>
                                    <span className="text-break">{order.email || 'Chưa có thông tin'}</span>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-2 mb-3">
                                <FaMapMarkerAlt className="text-warning flex-shrink-0 mt-1" />
                                <div>
                                    <small className="text-muted d-block">Địa chỉ giao hàng:</small>
                                    <span>{order.shippingAddress || 'Chưa có thông tin'}</span>
                                </div>
                            </div>

                            <hr className="my-3" />

                            <div className="d-flex align-items-center gap-2 mb-3">
                                <FaCreditCard className="text-warning flex-shrink-0" />
                                <div>
                                    <small className="text-muted d-block">Phương thức thanh toán:</small>
                                    <span className="fw-semibold">{order.paymentMethod || 'Chưa có thông tin'}</span>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <FaCalendarAlt className="text-warning flex-shrink-0" />
                                <div>
                                    <small className="text-muted d-block">Thời gian đặt:</small>
                                    <span>{formatDate(order.orderDate)}</span>
                                </div>
                            </div>

                            {order.notes && (
                                <div className="mt-3 p-3 bg-light rounded-3 text-secondary small">
                                    <strong>Ghi chú:</strong> {order.notes}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Danh sách sản phẩm */}
                <Col lg={8}>
                    <Card className="rounded-4 border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white fw-bold py-3 border-bottom d-flex justify-content-between align-items-center">
                            <span>Sản phẩm trong đơn ({items.length})</span>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {items.length === 0 ? (
                                <p className="text-muted p-4 mb-0">
                                    Đơn hàng chưa có thông tin sản phẩm chi tiết.
                                </p>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover align="middle" className="mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4">Sản phẩm</th>
                                                <th className="text-center">Số lượng</th>
                                                <th className="text-end">Đơn giá</th>
                                                <th className="text-end pe-4">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => {
                                                const quantity = Number(item.quantity || 1);
                                                const price = Number(item.price || item.unitPrice || 0);

                                                return (
                                                    <tr key={item.id || item.productId || index}>
                                                        <td className="ps-4">
                                                            <div className="d-flex align-items-center gap-3">
                                                                {item.image && (
                                                                    <img
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                                    />
                                                                )}
                                                                <div>
                                                                    <div className="fw-bold text-dark">
                                                                        {item.name || item.productName || 'Sản phẩm'}
                                                                    </div>
                                                                    {item.productId && (
                                                                        <small className="text-muted">Mã: {item.productId}</small>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-center fw-semibold">{quantity}</td>
                                                        <td className="text-end">{formatCurrency(price)}</td>
                                                        <td className="text-end pe-4 fw-bold text-danger">
                                                            {formatCurrency(price * quantity)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            )}

                            <div className="p-4 bg-light bg-opacity-50 border-top d-flex justify-content-between align-items-center">
                                <span className="fw-semibold text-secondary">Tổng cộng đơn hàng:</span>
                                <span className="fs-4 fw-bold text-danger">
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </main>
    );
}
