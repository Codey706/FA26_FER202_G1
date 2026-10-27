import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaClipboardCheck, FaArrowLeft } from 'react-icons/fa';
import orderService from '../services/orderService';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { calcTotal, getMaxQuantity } from '../utils/cartUtils';
import { formatCurrency } from '../utils/formatters';

const PAYMENT_METHODS = [
  'Tiền mặt khi nhận hàng (COD)',
  'Chuyển khoản ngân hàng',
  'Ví điện tử MoMo'
];

// Chấp nhận 0xxxxxxxxx hoặc +84xxxxxxxxx (bỏ qua khoảng trắng, dấu chấm, gạch, ngoặc).
const isValidPhone = (phone) =>
  /^(\+84|0)\d{9,10}$/.test(phone.replace(/[\s().-]/g, ''));

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart, refreshFromServer } = useCart();

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    shippingAddress: '',
    paymentMethod: PAYMENT_METHODS[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);
  const submittingRef = useRef(false); // chặn bấm đúp -> tạo trùng đơn

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    if (items.length === 0) {
      setError('Giỏ hàng đang trống. Vui lòng chọn sản phẩm trước khi thanh toán.');
      return;
    }

    const customer = {
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      shippingAddress: form.shippingAddress.trim(),
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim()
    };

    if (!customer.customerName) return setError('Vui lòng nhập họ và tên.');
    if (!isValidEmail(customer.email)) return setError('Email không hợp lệ. Vui lòng kiểm tra lại.');
    if (!isValidPhone(customer.phone)) return setError('Số điện thoại không hợp lệ (ví dụ: 0901234567).');
    if (!customer.shippingAddress) return setError('Vui lòng nhập địa chỉ nhận hàng.');

    submittingRef.current = true;
    setLoading(true);
    setError('');

    try {
      // 1. Kiểm tra lại giá / tồn kho mới nhất trước khi tạo đơn.
      const { items: freshItems, changes } = await refreshFromServer();

      if (freshItems.length === 0) {
        setError(`Giỏ hàng không còn sản phẩm hợp lệ. ${changes.join(' ')}`.trim());
        return;
      }

      if (changes.length > 0) {
        setError(`Giỏ hàng vừa thay đổi, vui lòng kiểm tra lại trước khi đặt: ${changes.join(' ')}`);
        return;
      }

      const soldOut = freshItems.find((item) => getMaxQuantity(item) < 1);
      if (soldOut) {
        setError(`"${soldOut.name}" đã hết hàng. Vui lòng quay lại giỏ hàng và xóa sản phẩm này.`);
        return;
      }

      // 2. Chuẩn bị đơn hàng từ dữ liệu đã xác minh.
      const order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userId: null,
        ...customer,
        items: freshItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image
        })),
        totalAmount: calcTotal(freshItems),
        orderStatus: 'pending',
        orderDate: new Date().toISOString()
      };

      // 3. Trừ tồn kho theo thứ tự để biết chính xác sản phẩm nào đã cập nhật.
      // JSON Server không hỗ trợ transaction; nếu một bước lỗi, cố gắng hoàn tác
      // các cập nhật đã thành công để tránh giữ tồn kho ở trạng thái dở dang.
      const stockUpdates = [];
      try {
        for (const item of freshItems) {
          const oldStock = Number(item.inStock);
          const quantity = Number(item.quantity);
          if (!Number.isFinite(oldStock) || oldStock < quantity) {
            throw new Error(`Tồn kho của "${item.name}" không hợp lệ hoặc không đủ. Vui lòng kiểm tra lại giỏ hàng.`);
          }

          const newStock = oldStock - quantity;
          await productService.updateStock(item.id, newStock);
          stockUpdates.push({ id: item.id, oldStock, name: item.name });
        }
      } catch (stockError) {
        const rollbackResults = await Promise.allSettled(
          stockUpdates.map(({ id, oldStock }) => productService.updateStock(id, oldStock))
        );
        const rollbackFailed = rollbackResults.some((result) => result.status === 'rejected');
        if (rollbackFailed) {
          throw new Error(`${stockError.message} Ngoài ra, việc khôi phục một phần tồn kho thất bại. Vui lòng kiểm tra dữ liệu sản phẩm trên server.`);
        }
        throw stockError;
      }

      // 4. Chỉ tạo đơn sau khi mọi cập nhật tồn kho thành công.
      // Nếu tạo đơn thất bại, hoàn tác tồn kho đã trừ.
      let created;
      try {
        created = await orderService.create(order);
      } catch (orderError) {
        const rollbackResults = await Promise.allSettled(
          stockUpdates.map(({ id, oldStock }) => productService.updateStock(id, oldStock))
        );
        const rollbackFailed = rollbackResults.some((result) => result.status === 'rejected');
        if (rollbackFailed) {
          throw new Error(`${orderError.message || 'Không thể tạo đơn hàng.'} Việc khôi phục tồn kho cũng thất bại; vui lòng kiểm tra dữ liệu trên server.`);
        }
        throw orderError;
      }

      // 5. Chỉ xóa giỏ và hiện thành công sau khi cập nhật tồn kho + tạo đơn xong.
      setSuccessOrder(created || order);
      clearCart();
    } catch (err) {
      setError(err.message || 'Không thể tạo đơn hàng. Hãy kiểm tra JSON Server ở cổng 3001.');
    } finally {
      submittingRef.current = false;
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
            <ul className="mb-3 ps-3">
              {successOrder.items?.map((item) => (
                <li key={item.productId}>{item.name} × {item.quantity}</li>
              ))}
            </ul>
            <p>Đơn hàng đã được lưu vào hệ thống với trạng thái “Chờ xác nhận”.</p>
            <Button variant="warning" className="text-white rounded-pill fw-bold" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          </Alert>
        ) : items.length === 0 ? (
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
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại *</Form.Label>
                        <Form.Control type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="Ví dụ: 0901234567" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Địa chỉ nhận hàng *</Form.Label>
                    <Form.Control as="textarea" rows={2} name="shippingAddress" value={form.shippingAddress} onChange={handleChange} required maxLength={300} placeholder="Số nhà, đường, phường/xã, tỉnh/thành" />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phương thức thanh toán</Form.Label>
                    <Form.Select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                      {PAYMENT_METHODS.map((method) => <option key={method}>{method}</option>)}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ghi chú</Form.Label>
                    <Form.Control as="textarea" rows={2} name="notes" value={form.notes} onChange={handleChange} maxLength={500} placeholder="Ghi chú cho cửa hàng (không bắt buộc)" />
                  </Form.Group>
                </div>
              </Col>

              <Col lg={5}>
                <div className="bg-white rounded-4 shadow-sm p-4">
                  <h5 className="fw-bold mb-3">Đơn hàng của bạn</h5>
                  {items.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between gap-3 py-2 border-bottom">
                      <div>
                        <div className="fw-semibold">{item.name}</div>
                        <small className="text-muted">Số lượng: {item.quantity}</small>
                      </div>
                      <strong className="text-nowrap">{formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between mt-3 mb-4 fs-5">
                    <strong>Tổng cộng</strong><strong className="text-danger">{formatCurrency(totalAmount)}</strong>
                  </div>
                  <Button type="submit" disabled={loading} variant="warning" className="w-100 text-white fw-bold rounded-pill py-3">
                    {loading ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng'}
                  </Button>
                  <Link to="/cart" className="d-flex justify-content-center align-items-center gap-2 mt-3">
                    <FaArrowLeft /> Quay lại giỏ hàng
                  </Link>
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
