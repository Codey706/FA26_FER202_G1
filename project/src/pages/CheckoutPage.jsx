import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';
import { FaClipboardCheck, FaArrowLeft, FaCheckCircle, FaUser, FaCreditCard } from 'react-icons/fa';
import OrderSummary from '../components/cart/OrderSummary';
import ShopPageHeader from '../components/cart/ShopPageHeader';
import orderService from '../services/orderService';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { calcOrderSummary, getMaxQuantity } from '../utils/cartUtils';
import { formatCurrency } from '../utils/formatters';

const PAYMENT_METHODS = [
  'Tiền mặt khi nhận hàng (COD)',
  'Chuyển khoản ngân hàng',
  'Ví điện tử MoMo'
];

// TODO: thay bằng thông tin tài khoản thật của cửa hàng.
const PAYMENT_GUIDE = {
  'Tiền mặt khi nhận hàng (COD)': {
    title: 'Thanh toán khi nhận hàng',
    lines: [
      'Bạn thanh toán trực tiếp cho nhân viên giao hàng khi nhận sản phẩm.',
      'Với thú cưng, nhân viên sẽ gọi điện xác nhận khoản đặt cọc giữ bé.'
    ]
  },
  'Chuyển khoản ngân hàng': {
    title: 'Thông tin chuyển khoản',
    lines: [
      'Ngân hàng: Vietcombank - Chi nhánh Cần Thơ',
      'Số tài khoản: 0123 456 789',
      'Chủ tài khoản: CONG TY TNHH PET SHOP',
      'Nội dung: Mã đơn hàng + Số điện thoại'
    ]
  },
  'Ví điện tử MoMo': {
    title: 'Thông tin ví MoMo',
    lines: [
      'Số ví: 0901 234 567 (PET SHOP)',
      'Nội dung: Mã đơn hàng + Số điện thoại'
    ]
  }
};

const MAX_NAME_LENGTH = 100;
const MAX_ADDRESS_LENGTH = 300;
const MAX_NOTES_LENGTH = 500;

const isValidName = (name) =>
  name.length <= MAX_NAME_LENGTH &&
  /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u.test(name);

const isValidPhone = (phone) => {
  const normalized = phone.replace(/[\s().-]/g, '');
  const domestic = normalized.startsWith('+84')
    ? `0${normalized.slice(3)}`
    : normalized;
  return /^(?:0[35789]\d{8}|02\d{8,9})$/.test(domestic);
};

const isValidEmail = (email) =>
  email.length <= 254 &&
  /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i.test(email) &&
  !email.includes('..');

const validateField = (name, value) => {
  const trimmed = value.trim();

  switch (name) {
    case 'customerName':
      if (!trimmed) return 'Vui lòng nhập họ và tên người nhận.';
      if (!isValidName(trimmed)) return 'Họ và tên chỉ được chứa chữ cái, dấu cách, dấu nháy hoặc dấu gạch nối.';
      return '';
    case 'phone':
      if (!trimmed) return 'Vui lòng nhập số điện thoại.';
      if (!isValidPhone(trimmed)) return 'Vui lòng nhập số điện thoại Việt Nam hợp lệ (ví dụ: 0901234567 hoặc +84901234567).';
      return '';
    case 'email':
      if (!trimmed) return 'Vui lòng nhập email.';
      if (!isValidEmail(trimmed)) return 'Địa chỉ email không đúng định dạng.';
      return '';
    case 'shippingAddress':
      if (!trimmed) return 'Vui lòng nhập địa chỉ nhận hàng.';
      if (trimmed.length < 5 || trimmed.length > MAX_ADDRESS_LENGTH) {
        return `Địa chỉ phải có từ 5 đến ${MAX_ADDRESS_LENGTH} ký tự.`;
      }
      return '';
    case 'paymentMethod':
      return PAYMENT_METHODS.includes(value) ? '' : 'Vui lòng chọn phương thức thanh toán hợp lệ.';
    case 'notes':
      return value.length > MAX_NOTES_LENGTH
        ? `Ghi chú không được vượt quá ${MAX_NOTES_LENGTH} ký tự.`
        : '';
    default:
      return '';
  }
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart, refreshFromServer, syncing } = useCart();

  const [form, setForm] = useState({
    customerName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    shippingAddress: user?.address || '',
    paymentMethod: PAYMENT_METHODS[0],
    notes: ''
  });

  // Tự động cập nhật form nếu user đăng nhập hoặc thay đổi
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || user.fullName || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        shippingAddress: prev.shippingAddress || user.address || ''
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successOrder, setSuccessOrder] = useState(null);
  const submittingRef = useRef(false); // chặn bấm đúp -> tạo trùng đơn

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      const fieldError = validateField(name, value);
      if (fieldError) next[name] = fieldError;
      else delete next[name];
      return next;
    });
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

    const validationErrors = Object.fromEntries(
      Object.entries(form)
        .map(([name, value]) => [name, validateField(name, value)])
        .filter(([, message]) => message)
    );
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      submittingRef.current = true;
      setLoading(true);
      setError('');

      // 1. Luôn đồng bộ dữ liệu mới nhất từ server trước khi trừ tồn kho.
      const { items: freshItems, changes: cartChanges } = await refreshFromServer();
      if (!freshItems || freshItems.length === 0) {
        setError('Giỏ hàng đang trống hoặc sản phẩm trong giỏ không còn tồn tại.');
        return;
      }

      // Kiểm tra thay đổi giá hoặc số lượng tối đa so với thời điểm bấm đặt hàng.
      const changes = [...cartChanges];
      freshItems.forEach((fresh) => {
        const local = items.find((it) => String(it.id) === String(fresh.id));
        if (local && Number(local.price) !== Number(fresh.price)) {
          changes.push(`Giá của "${fresh.name}" đã đổi sang ${formatCurrency(fresh.price)}.`);
        }
        if (local && Number(local.quantity) !== Number(fresh.quantity)) {
          changes.push(`Số lượng "${fresh.name}" đã được điều chỉnh theo tồn kho.`);
        }
      });

      if (changes.length > 0) {
        setError(`Giỏ hàng vừa thay đổi, vui lòng kiểm tra lại trước khi đặt: ${[...new Set(changes)].join(' ')}`);
        return;
      }

      const soldOut = freshItems.find((item) => getMaxQuantity(item) < 1);
      if (soldOut) {
        setError(`"${soldOut.name}" đã hết hàng. Vui lòng quay lại giỏ hàng và xóa sản phẩm này.`);
        return;
      }

      // 2. Chuẩn bị đơn hàng từ dữ liệu đã xác minh và gắn userId của người dùng
      const summary = calcOrderSummary(freshItems);
      const order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userId: user ? user.id : null,
        ...customer,
        items: freshItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image,
          petType: item.petType
        })),
        subtotal: summary.subtotal,
        shippingFee: summary.shippingFee,
        depositAmount: summary.deposit,
        remainingAmount: summary.remaining,
        totalAmount: summary.total,
        orderStatus: 'pending',
        orderDate: new Date().toISOString()
      };

      // 3. Trừ tồn kho theo thứ tự để biết chính xác sản phẩm nào đã cập nhật.
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

  const guide = PAYMENT_GUIDE[form.paymentMethod];

  /* ---------- Đặt hàng thành công ---------- */
  if (successOrder) {
    const successGuide = PAYMENT_GUIDE[successOrder.paymentMethod];
    return (
      <main className="shop-page">
        <ShopPageHeader
          icon={<FaClipboardCheck />}
          badge="Thanh toán"
          title="Đặt hàng"
          highlight="thành công"
          subtitle="Cảm ơn bạn đã tin tưởng PET SHOP!"
          step={3}
        />
        <Container>
          <div className="shop-card shop-empty mx-auto" style={{ maxWidth: 680 }}>
            <div className="shop-icon-box is-success"><FaCheckCircle /></div>
            <h4 className="fw-bold">Đơn hàng đã được ghi nhận</h4>
            <p className="mb-1">Mã đơn hàng: <strong>#{successOrder.id}</strong></p>
            <p className="mb-3">
              Tổng thanh toán: <strong className="text-danger">{formatCurrency(successOrder.totalAmount)}</strong>
              {Number(successOrder.shippingFee) > 0 && (
                <span className="text-muted"> (đã gồm phí vận chuyển {formatCurrency(successOrder.shippingFee)})</span>
              )}
            </p>
            <ul className="text-start d-inline-block mb-3 ps-3">
              {successOrder.items?.map((item) => (
                <li key={item.productId}>{item.name} × {item.quantity}</li>
              ))}
            </ul>
            {Number(successOrder.depositAmount) > 0 && (
              <div className="deposit-box text-start mb-3">
                Vui lòng đặt cọc <strong>{formatCurrency(successOrder.depositAmount)}</strong> để giữ bé,
                phần còn lại <strong>{formatCurrency(successOrder.remainingAmount)}</strong> thanh toán khi nhận bé.
              </div>
            )}
            {successGuide && (
              <div className="pay-info text-start mb-3">
                <strong>{successGuide.title}</strong>
                <ul>
                  {successGuide.lines.map((line) => <li key={line}>{line}</li>)}
                  {successOrder.paymentMethod !== PAYMENT_METHODS[0] && (
                    <li>Mã đơn hàng cần ghi trong nội dung: <strong>{successOrder.id}</strong></li>
                  )}
                </ul>
              </div>
            )}
            <p className="text-muted">Đơn hàng đã được lưu với trạng thái “Chờ xác nhận”.</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <button type="button" className="btn-shop-primary" onClick={() => navigate('/orders')}>
                Xem đơn hàng của bạn
              </button>
              <button type="button" className="btn-shop-outline" onClick={() => navigate('/')}>
                Về trang chủ
              </button>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="shop-page">
      <ShopPageHeader
        icon={<FaClipboardCheck />}
        badge="Thanh toán"
        title="Thông tin"
        highlight="đặt hàng"
        subtitle="Điền thông tin nhận hàng và chọn phương thức thanh toán."
        step={2}
      />

      <Container>
        {syncing ? (
          <div className="shop-card shop-empty">
            <Spinner animation="border" variant="warning" className="mb-3" />
            <p className="text-muted mb-0">Đang tải giỏ hàng của bạn...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="shop-card shop-empty">
            <div className="shop-icon-box"><FaClipboardCheck /></div>
            <h4 className="fw-bold">Giỏ hàng đang trống</h4>
            <p className="text-muted">Hãy chọn sản phẩm trước khi thanh toán nhé.</p>
            <Link to="/" className="btn-shop-primary">Quay lại chọn sản phẩm</Link>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} noValidate className="shop-form">
            <Row className="g-4">
              <Col lg={7}>
                <div className="shop-card">
                  <h5 className="shop-card-title">
                    <span className="shop-title-icon"><FaUser /></span>
                    Thông tin khách hàng
                  </h5>
                  {error && <Alert variant="danger" className="rounded-4">{error}</Alert>}

                  <Form.Group className="mb-3">
                    <Form.Label>Họ và tên *</Form.Label>
                    <Form.Control name="customerName" value={form.customerName} onChange={handleChange} required maxLength={MAX_NAME_LENGTH} isInvalid={Boolean(fieldErrors.customerName)} placeholder="Nhập họ và tên người nhận" />
                    <Form.Control.Feedback type="invalid">{fieldErrors.customerName}</Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại *</Form.Label>
                        <Form.Control type="tel" name="phone" value={form.phone} onChange={handleChange} required maxLength={20} isInvalid={Boolean(fieldErrors.phone)} placeholder="Ví dụ: 0901234567" />
                        <Form.Control.Feedback type="invalid">{fieldErrors.phone}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required maxLength={254} isInvalid={Boolean(fieldErrors.email)} placeholder="email@example.com" />
                        <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Địa chỉ nhận hàng *</Form.Label>
                    <Form.Control as="textarea" rows={2} name="shippingAddress" value={form.shippingAddress} onChange={handleChange} required maxLength={MAX_ADDRESS_LENGTH} isInvalid={Boolean(fieldErrors.shippingAddress)} placeholder="Số nhà, đường, phường/xã, tỉnh/thành" />
                    <Form.Control.Feedback type="invalid">{fieldErrors.shippingAddress}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ghi chú</Form.Label>
                    <Form.Control as="textarea" rows={2} name="notes" value={form.notes} onChange={handleChange} maxLength={MAX_NOTES_LENGTH} isInvalid={Boolean(fieldErrors.notes)} placeholder="Ghi chú cho cửa hàng (không bắt buộc)" />
                    <Form.Control.Feedback type="invalid">{fieldErrors.notes}</Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="shop-card mt-4">
                  <h5 className="shop-card-title">
                    <span className="shop-title-icon"><FaCreditCard /></span>
                    Phương thức thanh toán
                  </h5>
                  <Form.Group className="mb-3">
                    <Form.Select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} isInvalid={Boolean(fieldErrors.paymentMethod)}>
                      <option value="">Chọn phương thức thanh toán</option>
                      {PAYMENT_METHODS.map((method) => <option key={method}>{method}</option>)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{fieldErrors.paymentMethod}</Form.Control.Feedback>
                  </Form.Group>
                  {guide && (
                    <div className="pay-info">
                      <strong>{guide.title}</strong>
                      <ul>
                        {guide.lines.map((line) => <li key={line}>{line}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </Col>

              <Col lg={5}>
                <OrderSummary items={items}>
                  <div className="mb-3">
                    {items.map((item) => (
                      <div key={item.id} className="checkout-line">
                        {item.image && <img src={item.image} alt={item.name} />}
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{item.name}</div>
                          <small className="text-muted">Số lượng: {item.quantity}</small>
                        </div>
                        <strong className="text-nowrap">{formatCurrency(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>
                  <button type="submit" disabled={loading} className="btn-shop-primary w-100 py-3">
                    {loading ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng'}
                  </button>
                  <Link to="/cart" className="d-flex justify-content-center align-items-center gap-2 mt-3 fw-bold">
                    <FaArrowLeft /> Quay lại giỏ hàng
                  </Link>
                </OrderSummary>
              </Col>
            </Row>
          </Form>
        )}
      </Container>
    </main>
  );
};

export default CheckoutPage;
