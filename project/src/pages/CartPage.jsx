import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaArrowRight, FaPaw } from 'react-icons/fa';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';
import ShopPageHeader from '../components/cart/ShopPageHeader';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getMaxQuantity } from '../utils/cartUtils';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, clearCart, refreshFromServer } = useCart();

  const [notices, setNotices] = useState([]);

  // Làm mới giá / tồn kho khi mở giỏ hàng (bỏ qua nếu server không phản hồi).
  useEffect(() => {
    refreshFromServer()
      .then(({ changes }) => {
        if (changes.length > 0) setNotices(changes);
      })
      .catch(() => { });
  }, [refreshFromServer]);

  const hasUnavailable = items.some((item) => getMaxQuantity(item) < 1);

  const handleClear = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
      clearCart();
      setNotices([]);
    }
  };

  return (
    <main className="shop-page">
      <ShopPageHeader
        icon={<FaShoppingCart />}
        badge="Giỏ hàng của bạn"
        title="Giỏ hàng"
        highlight="mua sắm"
        subtitle="Kiểm tra sản phẩm và số lượng trước khi đặt hàng."
        step={1}
      />

      <Container>
        {notices.length > 0 && (
          <Alert variant="warning" dismissible onClose={() => setNotices([])} className="rounded-4">
            <div className="fw-bold mb-1">Giỏ hàng đã được cập nhật theo dữ liệu mới nhất:</div>
            <ul className="mb-0 ps-3">
              {notices.map((message) => <li key={message}>{message}</li>)}
            </ul>
          </Alert>
        )}

        {items.length === 0 ? (
          <div className="shop-card shop-empty">
            <div className="shop-icon-box"><FaShoppingCart /></div>
            <h4 className="fw-bold">Giỏ hàng đang trống</h4>
            <p className="text-muted">Hãy chọn một bé thú cưng hoặc phụ kiện mà bạn yêu thích nhé.</p>
            <button type="button" className="btn-shop-primary" onClick={() => navigate('/')}>
              <FaPaw /> Khám phá ngay
            </button>
          </div>
        ) : (
          <Row className="g-4">
            <Col lg={8}>
              <div className="shop-card">
                <h5 className="shop-card-title">
                  <span className="shop-title-icon"><FaShoppingCart /></span>
                  Sản phẩm đã chọn ({items.length})
                </h5>

                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
                  <Link to="/" className="d-inline-flex align-items-center gap-2 fw-bold text-decoration-none">
                    <FaArrowLeft /> Tiếp tục mua sắm
                  </Link>
                  <button type="button" className="btn-shop-danger" onClick={handleClear}>
                    <FaTrash /> Xóa tất cả
                  </button>
                </div>
              </div>
            </Col>

            <Col lg={4}>
              <OrderSummary items={items}>
                {hasUnavailable && (
                  <p className="text-danger small">
                    Giỏ hàng có sản phẩm đã hết hàng. Vui lòng xóa chúng để tiếp tục thanh toán.
                  </p>
                )}

                <button
                  type="button"
                  className="btn-shop-primary w-100 py-3"
                  disabled={hasUnavailable}
                  onClick={() => navigate('/checkout')}
                >
                  Tiến hành thanh toán <FaArrowRight />
                </button>

                {!user && (
                  <p className="text-muted small text-center mt-3 mb-0">
                    Bạn sẽ được yêu cầu <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="fw-bold">đăng nhập</Link> trước khi thanh toán.
                  </p>
                )}
              </OrderSummary>
            </Col>
          </Row>
        )}
      </Container>
    </main>
  );
};

export default CartPage;
