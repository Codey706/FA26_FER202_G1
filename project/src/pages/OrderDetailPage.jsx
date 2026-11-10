import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Alert, Button, Spinner, Table } from 'react-bootstrap';
import { FaArrowLeft, FaLock, FaUserAlt, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaCalendarAlt, FaCreditCard, FaShoppingBag } from 'react-icons/fa';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import '../styles/orderdetail.css';

const statusLabels = {
    pending: { label: 'Chờ xác nhận', variant: 'warning' },
    processing: { label: 'Đang xử lý', variant: 'info' },
    shipping: { label: 'Đang giao hàng', variant: 'primary' },
    delivered: { label: 'Đã giao hàng', variant: 'success' },
    cancelled: { label: 'Đã hủy', variant: 'danger' },
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
            <main className="mt-3 mb-0 p-2text-muted text-truncate d-inline-block" style={{ maxWidth: 220 }}>
                <Spinner animation="border" variant="warning" />
                <p className="mt-3 text-muted">Đang tải chi tiết đơn hàng...</p>
            </main>
        );
    }

    if (forbidden) {
        return (
            <main className="py-5" style={{ backgroundColor: '#fff9f2', minHeight: '100vh' }}>
                <Container>
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
                </Container>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="py-5" style={{ backgroundColor: '#fff9f2', minHeight: '100vh' }}>
                <Container>
                    <Alert variant="danger" className="rounded-4 p-4 text-center">
                        <h5>{error || 'Không tìm thấy đơn hàng.'}</h5>
                        <Button as={Link} to={backUrl} variant="outline-danger" className="rounded-pill mt-2">
                            <FaArrowLeft className="me-2" /> Quay lại danh sách
                        </Button>
                    </Alert>
                </Container>
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
        bg: '#f1f5f9',
        color: '#475569'
    };

    return (
        <main className="py-4" style={{ backgroundColor: '#fff9f2', minHeight: '100vh' }}>
            <Container className="order-detail-container">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                    <div>
                        <Link to={backUrl} className="btn btn-outline-secondary btn-sm mb-3">
                            <FaArrowLeft size={12} /> {isStaffOrAdmin ? 'Quay lại Quản lý đơn' : 'Quay lại Đơn hàng của tôi'}
                        </Link>
                        <h2 className="fw-bold mb-2">Chi tiết đơn hàng</h2>
                        <p>Mã đơn hàng: <strong>#{order.id}</strong></p>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">Trạng thái:</span>
                        <Badge
                            bg={statusConfig.variant}
                            className="rounded-pill px-3 py-2"
                        >
                            {statusConfig.label}
                        </Badge>
                    </div>
                </div>

                <Row className="g-4">
                    {/* Thông tin đơn hàng & khách hàng */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm rounded-4 mb-4">
                            <Card.Header className="bg-white border-bottom p-3 rounded-top-4">
                                <h5 className="fw-bold mb-1" style={{ color: '#333' }}>
                                    <FaUserAlt className="me-2" style={{ color: '#ff7a00' }} />
                                    Thông tin người nhận
                                </h5>
                                <small className="text-muted">Thông tin giao hàng của bạn</small>
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
                            <Card.Header className="bg-white border-bottom p-3 rounded-top-4">
                                <h5 className="fw-bold mb-0">
                                    <FaShoppingBag className="me-2" style={{ color: '#ff7a00' }} />
                                    Sản phẩm trong đơn ({items.length})
                                </h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {items.length === 0 ? (
                                    <p className="text-muted p-4 mb-0">
                                        Đơn hàng chưa có thông tin sản phẩm chi tiết.
                                    </p>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover className="align-middle mb-0">
                                            <thead style={{ backgroundColor: '#fff3e6', color: '#914800' }}>
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

                                {order.shippingFee !== undefined && (
                                    <div className="px-4 pt-3 border-top">
                                        <div className="d-flex justify-content-between text-secondary mb-1">
                                            <span>Tạm tính</span>
                                            <span>{formatCurrency(order.subtotal ?? (Number(order.totalAmount) - Number(order.shippingFee)))}</span>
                                        </div>
                                        <div className="d-flex justify-content-between text-secondary mb-1">
                                            <span>Phí vận chuyển</span>
                                            <span>{Number(order.shippingFee) > 0 ? formatCurrency(order.shippingFee) : 'Miễn phí'}</span>
                                        </div>
                                        {Number(order.depositAmount) > 0 && (
                                            <>
                                                <div className="d-flex justify-content-between text-success mb-1">
                                                    <span>Đặt cọc giữ bé</span>
                                                    <span>{formatCurrency(order.depositAmount)}</span>
                                                </div>
                                                <div className="d-flex justify-content-between text-secondary mb-1">
                                                    <span>Thanh toán khi nhận bé</span>
                                                    <span>{formatCurrency(order.remainingAmount)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="order-detail-total px-4 py-3 border-top d-flex justify-content-between align-items-center">
                                    <span className="fw-semibold text-secondary">Tổng cộng đơn hàng:</span>
                                    <span className="order-detail-total-price">
                                        {formatCurrency(order.totalAmount)}
                                    </span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </main>
    );
}
