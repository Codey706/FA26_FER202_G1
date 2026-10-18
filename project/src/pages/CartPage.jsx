import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

const CartPage = ({ cartItems, onUpdateQuantity, onRemove }) => {
  const navigate = useNavigate();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="py-5" style={{ background: '#fffaf5', minHeight: '65vh' }}>
      <Container>
        <div className="mb-4">
          <span className="section-badge"><FaShoppingCart /> Giỏ hàng của bạn</span>
          <h1 className="section-title mt-3">Giỏ hàng <span>mua sắm</span></h1>
          <p className="text-muted">Kiểm tra sản phẩm và số lượng trước khi đặt hàng.</p>
        </div>

        {cartItems.length === 0 ? (
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
                {cartItems.map((item) => {
                  const isPet = item.petType === 'dog' || item.petType === 'cat';
                  return (
                    <div key={item.id} className="d-flex flex-column flex-sm-row align-items-sm-center gap-3 py-3 border-bottom">
                      <img src={item.image} alt={item.name} className="rounded-3" style={{ width: 112, height: 96, objectFit: 'cover' }} />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">{item.name}</h6>
                        <div className="text-warning fw-bold">{formatCurrency(item.price)}</div>
                        <small className="text-muted">{isPet ? 'Thú cưng (mỗi bé chỉ có 1)' : 'Phụ kiện / thức ăn'}</small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Button size="sm" variant="outline-secondary" disabled={isPet || item.quantity <= 1} onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} aria-label="Giảm số lượng">−</Button>
                        <span className="fw-bold px-1">{item.quantity}</span>
                        <Button size="sm" variant="outline-secondary" disabled={isPet} onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} aria-label="Tăng số lượng">+</Button>
                      </div>
                      <Button variant="outline-danger" size="sm" onClick={() => onRemove(item.id)} title="Xóa sản phẩm"><FaTrash /></Button>
                    </div>
                  );
                })}
                <Link to="/" className="d-inline-flex align-items-center gap-2 mt-4 text-decoration-none"><FaArrowLeft /> Tiếp tục mua sắm</Link>
              </div>
            </Col>
            <Col lg={4}>
              <div className="bg-white rounded-4 shadow-sm p-4">
                <h5 className="fw-bold mb-4">Tóm tắt đơn hàng</h5>
                <div className="d-flex justify-content-between mb-3"><span>Số lượng sản phẩm</span><strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
                <div className="d-flex justify-content-between border-top pt-3 mb-3"><span>Tạm tính</span><strong>{formatCurrency(total)}</strong></div>
                <div className="d-flex justify-content-between mb-4"><span>Phí vận chuyển</span><span className="text-success fw-bold">Miễn phí</span></div>
                <div className="d-flex justify-content-between border-top pt-3 mb-4 fs-5"><strong>Tổng cộng</strong><strong className="text-danger">{formatCurrency(total)}</strong></div>
                <Button className="w-100 rounded-pill fw-bold py-3 text-white" variant="warning" onClick={() => navigate('/checkout')}>Tiến hành thanh toán <FaArrowRight className="ms-2" /></Button>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </main>
  );
};

export default CartPage;
