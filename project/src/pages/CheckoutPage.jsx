import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaClipboardCheck, FaArrowLeft } from 'react-icons/fa';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const CheckoutPage = ({ cartItems, onClearCart }) => {
  const navigate = useNavigate();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', shippingAddress: '', paymentMethod: 'Tiền mặt khi nhận hàng (COD)', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!cartItems.length) {
      setError('Giỏ hàng đang trống. Vui lòng chọn sản phẩm trước khi thanh toán.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const order = {
        userId: null,
        ...form,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity)
        })),
        totalAmount: total,
        orderStatus: 'pending',
        orderDate: new Date().toISOString()
      };
      const created = await api.post('/orders', order);
      setSuccessOrder(created);
      onClearCart();
    } catch (err) {
      setError(err.message || 'Không thể tạo đơn hàng. Hãy kiểm tra JSON Server ở cổng 3001.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="py-5" style={{ background: '#fffaf5', minHeight: '65vh' }}>
      <Container>
        <span className="section-badge"><FaClipboardCheck /> Thanh toán</span>
        <h1 className="section-title mt-3 mb-4">Thông tin <span>đặt hàng</span></h1>

        {successOrder ? (
          <Alert variant="success" className="rounded-4 p-4">
            <h4 className="fw-bold">Đặt hàng thành công!</h4>
            <p className="mb-1">Mã đơn hàng: <strong>#{successOrder.id}</strong></p>
            <p className="mb-3">Tổng thanh toán: <strong>{formatCurrency(successOrder.totalAmount)}</strong></p>
            <p>Đơn hàng đã được lưu vào hệ thống với trạng thái “Chờ xác nhận”.</p>
            <Button variant="warning" className="text-white rounded-pill fw-bold" onClick={() => navigate('/')}>Về trang chủ</Button>
          </Alert>
        ) : cartItems.length === 0 ? (
          <Alert variant="info" className="rounded-4">
            Giỏ hàng đang trống. <Link to="/">Quay lại chọn sản phẩm</Link>.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              <Col lg={7}>
                <div className="bg-white rounded-4 shadow-sm p-4">
                  <h5 className="fw-bold mb-3">Thông tin khách hàng</h5>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Form.Group className="mb-3">
                    <Form.Label>Họ và tên *</Form.Label>
                    <Form.Control name="customerName" value={form.customerName} onChange={handleChange} required maxLength={100} placeholder="Nhập họ và tên người nhận" />
                  </Form.Group>
                  <Row>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Số điện thoại *</Form.Label><Form.Control name="phone" value={form.phone} onChange={handleChange} required pattern="[0-9+() .-]{9,20}" placeholder="Ví dụ: 0901234567" /></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Email *</Form.Label><Form.Control type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" /></Form.Group></Col>
                  </Row>
                  <Form.Group className="mb-3"><Form.Label>Địa chỉ nhận hàng *</Form.Label><Form.Control as="textarea" rows={2} name="shippingAddress" value={form.shippingAddress} onChange={handleChange} required maxLength={300} placeholder="Số nhà, đường, phường/xã, tỉnh/thành" /></Form.Group>
                  <Form.Group className="mb-3"><Form.Label>Phương thức thanh toán</Form.Label><Form.Select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}><option>Tiền mặt khi nhận hàng (COD)</option><option>Chuyển khoản ngân hàng</option><option>Ví điện tử MoMo</option></Form.Select></Form.Group>
                  <Form.Group className="mb-3"><Form.Label>Ghi chú</Form.Label><Form.Control as="textarea" rows={2} name="notes" value={form.notes} onChange={handleChange} maxLength={500} placeholder="Ghi chú cho cửa hàng (không bắt buộc)" /></Form.Group>
                </div>
              </Col>
              <Col lg={5}>
                <div className="bg-white rounded-4 shadow-sm p-4">
                  <h5 className="fw-bold mb-3">Đơn hàng của bạn</h5>
                  {cartItems.map((item) => <div key={item.id} className="d-flex justify-content-between gap-3 py-2 border-bottom"><div><div className="fw-semibold">{item.name}</div><small className="text-muted">Số lượng: {item.quantity}</small></div><strong className="text-nowrap">{formatCurrency(item.price * item.quantity)}</strong></div>)}
                  <div className="d-flex justify-content-between mt-3 mb-4 fs-5"><strong>Tổng cộng</strong><strong className="text-danger">{formatCurrency(total)}</strong></div>
                  <Button type="submit" disabled={loading} variant="warning" className="w-100 text-white fw-bold rounded-pill py-3">{loading ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng'}</Button>
                  <Link to="/cart" className="d-flex justify-content-center align-items-center gap-2 mt-3"><FaArrowLeft /> Quay lại giỏ hàng</Link>
                </div>
              </Col>
            </Row>
          </Form>
        )}
      </Container>
    </main>
  );
};

export default CheckoutPage;
