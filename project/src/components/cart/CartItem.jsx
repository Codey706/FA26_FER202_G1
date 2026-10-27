import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';
import { getMaxQuantity, isPet } from '../../utils/cartUtils';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const pet = isPet(item);
  const max = getMaxQuantity(item);
  const unavailable = max < 1;

  // Ô nhập số lượng: giữ bản nháp, chỉ áp dụng khi rời ô / nhấn Enter.
  const [draft, setDraft] = useState(String(item.quantity));

  useEffect(() => {
    setDraft(String(item.quantity));
  }, [item.quantity]);

  const commitDraft = () => {
    const parsed = Number.parseInt(draft, 10);

    if (!Number.isFinite(parsed) || parsed < 1) {
      setDraft(String(item.quantity));
      return;
    }

    onUpdateQuantity(item.id, parsed);
    setDraft(String(Math.max(1, Math.min(parsed, max))));
  };

  const lineTotal = item.price * item.quantity;

  return (
    <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3 py-3 border-bottom">
      <img
        src={item.image || FALLBACK_IMG}
        alt={item.name}
        className="rounded-3"
        style={{ width: 112, height: 96, objectFit: 'cover' }}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = FALLBACK_IMG;
        }}
      />

      <div className="flex-grow-1">
        <h6 className="fw-bold mb-1">{item.name}</h6>
        <div className="text-warning fw-bold">{formatCurrency(item.price)}</div>
        <small className="text-muted d-block">
          {pet ? 'Thú cưng (mỗi bé chỉ có 1)' : 'Phụ kiện / thức ăn'}
        </small>
        {unavailable ? (
          <small className="text-danger fw-semibold">
            Sản phẩm đã hết hàng, vui lòng xóa khỏi giỏ.
          </small>
        ) : (
          !pet &&
          item.quantity >= max && (
            <small className="text-danger">Đã đạt số lượng tối đa ({max}).</small>
          )
        )}
      </div>

      <div className="d-flex align-items-center gap-2">
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={pet || unavailable || item.quantity <= 1}
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          aria-label="Giảm số lượng"
        >
          −
        </Button>

        <input
          type="text"
          inputMode="numeric"
          className="form-control form-control-sm text-center fw-bold"
          style={{ width: 56 }}
          value={draft}
          disabled={pet || unavailable}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, ''))}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
          aria-label={`Số lượng ${item.name}`}
        />

        <Button
          size="sm"
          variant="outline-secondary"
          disabled={pet || unavailable || item.quantity >= max}
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          aria-label="Tăng số lượng"
        >
          +
        </Button>
      </div>

      <div className="text-sm-end fw-bold" style={{ minWidth: 120 }}>
        {formatCurrency(lineTotal)}
      </div>

      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => onRemove(item.id)}
        title="Xóa sản phẩm"
        aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
      >
        <FaTrash />
      </Button>
    </div>
  );
};

export default CartItem;
