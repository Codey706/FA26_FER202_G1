import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaStar,
  FaShieldAlt,
  FaPaw,
  FaShoppingCart,
  FaBolt
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';

const DEFAULT_FALLBACK_IMG =
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';

const PetCard = ({ pet, onAddToCart }) => {
  const [imgSrc, setImgSrc] = useState(
    pet?.image || DEFAULT_FALLBACK_IMG
  );
  const navigate = useNavigate();
  const { items } = useCart();

  if (!pet) return null;

  const outOfStock = Number(pet.inStock) <= 0;
  const isMale = pet.gender?.toLowerCase() === 'đực';

  // Mua ngay: thêm vào giỏ rồi chuyển thẳng sang trang thanh toán.
  // (/checkout đã bọc RequireAuth nên chưa đăng nhập sẽ được đưa tới /login.)
  const handleBuyNow = () => {
    if (outOfStock) return;

    const alreadyInCart = items.some(
      (item) => String(item.id) === String(pet.id)
    );

    if (!alreadyInCart && onAddToCart) {
      const result = onAddToCart(pet);
      if (result?.ok === false) {
        alert(result.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
        return;
      }
    }

    navigate('/checkout');
  };

  return (
    <>
      <div className="pet-card">
        <div className="pet-card-thumb">
          {pet.discount > 0 && (
            <span className="badge-tag-discount">
              -{pet.discount}%
            </span>
          )}

          {pet.gender && (
            <span
              className={`badge-tag-gender ${
                isMale ? 'badge-gender-male' : 'badge-gender-female'
              }`}
            >
              {pet.gender}
            </span>
          )}

          <img
            src={imgSrc}
            alt={pet.name}
            loading="lazy"
            onError={() => setImgSrc(DEFAULT_FALLBACK_IMG)}
          />
        </div>

        <div className="pet-card-body">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-1 text-warning small">
              <FaStar />
              <strong className="text-dark ms-1">
                {pet.rating || 5.0}
              </strong>
              <span className="text-muted">
                ({pet.reviewCount || 10})
              </span>
            </div>

            <span className="badge bg-light text-secondary border small">
              {pet.petType === 'dog' ? 'Chó Cảnh' : 'Mèo Cảnh'}
            </span>
          </div>

          <h5 className="pet-card-title" title={pet.name}>
            {pet.name}
          </h5>

          <div className="pet-meta-row">
            {pet.age && (
              <span className="pet-meta-tag">
                <FaPaw className="text-warning" />
                {pet.age}
              </span>
            )}

            {pet.color && (
              <span
                className="pet-meta-tag text-truncate"
                style={{ maxWidth: 140 }}
              >
                {pet.color}
              </span>
            )}

            {pet.healthCheck && (
              <span className="pet-meta-tag text-success">
                <FaShieldAlt /> Sức khỏe tốt
              </span>
            )}
          </div>

          <div className="pet-price-box">
            <div>
              <div className="current-price">
                {formatCurrency(pet.price)}
              </div>

              {pet.originalPrice &&
                pet.originalPrice > pet.price && (
                  <div className="original-price">
                    {formatCurrency(pet.originalPrice)}
                  </div>
                )}
            </div>
          </div>

          {/* Nút chuyển đến trang chi tiết thú cưng */}
          <Link
            to={`/products/${pet.id}`}
            className="btn btn-outline-secondary btn-sm rounded-pill mb-2 w-100"
          >
            Xem chi tiết
          </Link>

          <div className="pet-card-actions d-flex flex-column gap-2">
            <button
              type="button"
              className="btn btn-card-action btn-cart-accessory"
              onClick={() => onAddToCart && onAddToCart(pet)}
              disabled={outOfStock}
              title={outOfStock ? 'Sản phẩm đã hết hàng' : undefined}
            >
              <FaShoppingCart className="small" />
              {outOfStock ? 'Hết Hàng' : 'Thêm Vào Giỏ'}
            </button>

            <button
              type="button"
              className="btn btn-warning text-white fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2"
              onClick={handleBuyNow}
              disabled={outOfStock}
              title={outOfStock ? 'Sản phẩm đã hết hàng' : 'Mua ngay và chuyển tới trang thanh toán'}
            >
              <FaBolt className="small" />
              Mua Ngay
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PetCard;
