import { FREE_SHIPPING_THRESHOLD, PET_DEPOSIT_RATE, calcOrderSummary } from '../../utils/cartUtils';
import { formatCurrency } from '../../utils/formatters';

/** Khối "Tóm tắt đơn hàng" dùng chung cho trang Giỏ hàng và Thanh toán. */
const OrderSummary = ({ items, children }) => {
  const s = calcOrderSummary(items);
  const progress = Math.min(100, Math.round((s.subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="shop-card shop-sticky">
      <h5 className="shop-card-title">Tóm tắt đơn hàng</h5>

      <div className="summary-row">
        <span>Số lượng sản phẩm</span>
        <strong>{s.count}</strong>
      </div>
      <div className="summary-row">
        <span>Tạm tính</span>
        <strong>{formatCurrency(s.subtotal)}</strong>
      </div>
      <div className="summary-row">
        <span>Phí vận chuyển</span>
        {s.shippingFee === 0 ? (
          <span className="text-success fw-bold">Miễn phí</span>
        ) : (
          <strong>{formatCurrency(s.shippingFee)}</strong>
        )}
      </div>

      {s.freeShippingGap > 0 && (
        <div className="free-ship-note">
          Mua thêm <strong>{formatCurrency(s.freeShippingGap)}</strong> để được miễn phí vận chuyển.
          <div className="free-ship-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="summary-total">
        <strong>Tổng cộng</strong>
        <span className="amount">{formatCurrency(s.total)}</span>
      </div>

      {s.deposit > 0 && (
        <div className="deposit-box">
          <div className="d-flex justify-content-between">
            <span>Đặt cọc giữ bé ({Math.round(PET_DEPOSIT_RATE * 100)}%)</span>
            <strong className="text-success">{formatCurrency(s.deposit)}</strong>
          </div>
          <div className="d-flex justify-content-between mt-1">
            <span>Thanh toán khi nhận bé</span>
            <strong>{formatCurrency(s.remaining)}</strong>
          </div>
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default OrderSummary;
