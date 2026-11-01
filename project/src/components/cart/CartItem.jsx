import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaPaw, FaBoxOpen } from 'react-icons/fa';
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
    <div className="cart-item">
      <Link to={`/products/${item.id}`}>
        <img
          src={item.image || FALLBACK_IMG}
          alt={item.name}
          className="cart-item-img"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMG;
          }}
        />
      </Link>

      <div className="cart-item-info">
        <Link to={`/products/${item.id}`} className="cart-item-name">
          {item.name}
        </Link>
        <div className="cart-item-price">{formatCurrency(item.price)}</div>
        <span className={`cart-item-tag ${pet ? 'is-pet' : ''}`}>
          {pet ? <FaPaw /> : <FaBoxOpen />}
          {pet ? 'Thú cưng (mỗi bé chỉ có 1)' : 'Phụ kiện / thức ăn'}
        </span>
        {unavailable ? (
          <span className="cart-item-warn">Sản phẩm đã hết hàng, vui lòng xóa khỏi giỏ.</span>
        ) : (
          !pet &&
          item.quantity >= max && (
            <span className="cart-item-warn">Đã đạt số lượng tối đa ({max}).</span>
          )
        )}
      </div>

      <div className="qty-stepper">
        <button
          type="button"
          className="qty-btn"
          disabled={pet || unavailable || item.quantity <= 1}
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          aria-label="Giảm số lượng"
        >
          −
        </button>

        <input
          type="text"
          inputMode="numeric"
          className="qty-input"
          value={draft}
          disabled={pet || unavailable}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, ''))}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
          aria-label={`Số lượng ${item.name}`}
        />

        <button
          type="button"
          className="qty-btn"
          disabled={pet || unavailable || item.quantity >= max}
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          aria-label="Tăng số lượng"
        >
          +
        </button>
      </div>

      <div className="cart-item-total">{formatCurrency(lineTotal)}</div>

      <button
        type="button"
        className="cart-remove-btn"
        onClick={() => onRemove(item.id)}
        title="Xóa sản phẩm"
        aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
      >
        <FaTrash size={14} />
      </button>
    </div>
  );
};

export default CartItem;
