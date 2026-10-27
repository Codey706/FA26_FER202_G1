import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import CartItem from '../components/cart/CartItem';
import { useCart } from '../context/CartContext';
import { getMaxQuantity } from '../utils/cartUtils';
import { formatCurrency } from '../utils/formatters';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    items,
    cartCount,
    totalAmount,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshFromServer,
  } = useCart();

  const [notices, setNotices] = useState([]);

  // Làm mới giá / tồn kho khi mở giỏ hàng (bỏ qua nếu server không phản hồi).
  useEffect(() => {
    refreshFromServer()
      .then(({ changes }) => {
        if (changes.length > 0) setNotices(changes);
      })
      .catch(() => {});
  }, [refreshFromServer]);

  const hasUnavailable = items.some((item) => getMaxQuantity(item) < 1);

  const handleClear = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
      clearCart();
      setNotices([]);
    }
  };

  return (
    <main className="py-5" style={{ background: '#fffaf5', minHeight: '65vh' }}>
      <Container>
        <div className="mb-4">
          <span className="section-badge"><FaShoppingCart /> Giỏ hàng của bạn</span>
          <h1 className="section-title mt-3">Giỏ hàng <span>mua sắm</span></h1>
          <p className="text-muted">Kiểm tra sản phẩm và số lượng trước khi đặt hàng.</p>
        </div>

        {notices.length > 0 && (
          <Alert variant="warning" dismissible onClose={() => setNotices([])} className="rounded-4">
            <div className="fw-bold mb-1">Giỏ hàng đã được cập nhật theo dữ liệu mới nhất:</div>
            <ul className="mb-0 ps-3">
              {notices.map((message) => <li key={message}>{message}</li>)}
            </ul>
          </Alert>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-4 shadow-sm text-center p-5">
            <FaShoppingCart className="display-3 text-warning mb-3" />
            <h4 className="fw-bold">Giỏ hàng đang trống</h4>
            <p className="text-muted">Hãy chọn một bé thú cưng hoặc phụ kiện mà bạn yêu thích nhé.</p>
            <Button variant="warning" className="text-white fw-bold rounded-pill px-4" onClick={() => navigate('/')}>
              <FaArrowLeft className="me-2" /> Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <Row className="g-4">
            <Col lg={8}>
              <div className="bg-white rounded-4 shadow-sm p-3 p-md-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
                  <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none">
                    <FaArrowLeft /> Tiếp tục mua sắm
                  </Link>
                  <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={handleClear}>
                    <FaTrash className="me-2" /> Xóa tất cả
                  </Button>
                </div>
              </div>
            </Col>

            <Col lg={4}>
              <div className="bg-white rounded-4 shadow-sm p-4">
                <h5 className="fw-bold mb-4">Tóm tắt đơn hàng</h5>
                <div className="d-flex justify-content-between mb-3">
                  <span>Số lượng sản phẩm</span><strong>{cartCount}</strong>
                </div>
                <div className="d-flex justify-content-between border-top pt-3 mb-3">
                  <span>Tạm tính</span><strong>{formatCurrency(totalAmount)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-4">
                  <span>Phí vận chuyển</span><span className="text-success fw-bold">Miễn phí</span>
                </div>
                <div className="d-flex justify-content-between border-top pt-3 mb-4 fs-5">
                  <strong>Tổng cộng</strong><strong className="text-danger">{formatCurrency(totalAmount)}</strong>
                </div>

                {hasUnavailable && (
                  <p className="text-danger small">
                    Giỏ hàng có sản phẩm đã hết hàng. Vui lòng xóa chúng để tiếp tục thanh toán.
                  </p>
                )}

                <Button
                  className="w-100 rounded-pill fw-bold py-3 text-white"
                  variant="warning"
                  disabled={hasUnavailable}
                  onClick={() => navigate('/checkout')}
                >
                  Tiến hành thanh toán <FaArrowRight className="ms-2" />
                </Button>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </main>
  );
};

export default CartPage;
