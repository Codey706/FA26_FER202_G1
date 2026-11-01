import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import {
  FaShoppingCart,
  FaStar,
  FaCheck,
  FaEye,
  FaTag
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_ACC_FALLBACK =
  'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80';

const ProductCard = ({ product, onAddToCart }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product?.image || DEFAULT_ACC_FALLBACK);
  const addedTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(addedTimerRef.current), []);

  if (!product) return null;

  const handleAdd = () => {
    const result = onAddToCart ? onAddToCart(product) : { ok: true };

    // Chỉ hiện "Đã thêm" khi thực sự thêm được (không hết hàng / vượt tồn kho).
    if (result?.ok === false) return;

    setAdded(true);
    clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div className="product-card">
        {/* Thumbnail */}
        <div className="product-card-thumb">
          {product.discount > 0 && (
            <span className="badge-tag-discount">-{product.discount}%</span>
          )}

          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            onError={() => setImgSrc(DEFAULT_ACC_FALLBACK)}
          />

          <button
            type="button"
            className="btn btn-sm position-absolute"
            style={{
              bottom: 12,
              right: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              color: '#475569',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onClick={() => setShowDetail(true)}
            title="Xem chi tiết sản phẩm"
          >
            <FaEye />
          </button>
        </div>

        {/* Card Body */}
        <div className="product-card-body">
          {/* Brand & Rating */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="badge bg-light text-muted border small text-truncate" style={{ maxWidth: 140 }}>
              <FaTag className="me-1 text-warning" />
              {product.brand || 'Chính hãng'}
            </span>
            <div className="d-flex align-items-center gap-1 text-warning small">
              <FaStar />
              <strong className="text-dark ms-1">{product.rating || 5.0}</strong>
              <span className="text-muted">({product.reviewCount || 10})</span>
            </div>
          </div>

          {/* Name */}
          <h5 className="product-card-title" title={product.name}>
            {product.name}
          </h5>

          {/* Specifications */}
          {product.weight && (
            <div className="small text-muted mb-2">
              Quy cách: <strong>{product.weight}</strong>
            </div>
          )}

          {/* Price */}
          <div className="pet-price-box">
            <div>
              <div className="current-price">{formatCurrency(product.price)}</div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="original-price">
                  {formatCurrency(product.originalPrice)}
                </div>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="pet-card-actions">
            <button
              type="button"
              className={`btn btn-card-action ${
                added ? 'btn-success text-white' : 'btn-cart-accessory'
              }`}
              onClick={handleAdd}
            >
              {added ? (
                <>
                  <FaCheck /> Đã Thêm Vào Giỏ
                </>
              ) : (
                <>
                  <FaShoppingCart /> Thêm Vào Giỏ
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-5">Chi Tiết Sản Phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <img
            src={imgSrc}
            alt={product.name}
            className="img-fluid rounded-4 mb-3"
            style={{ maxHeight: 220, objectFit: 'cover' }}
          />
          <h5 className="fw-bold mb-2">{product.name}</h5>
          <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
            <span className="fs-5 fw-bold text-danger">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-muted text-decoration-line-through small">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          <p className="text-muted small text-start bg-light p-3 rounded-3 mb-0">
            {product.description}
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            className="rounded-pill"
            onClick={() => setShowDetail(false)}
          >
            Đóng
          </Button>
          <Button
            variant="warning"
            className="rounded-pill text-white fw-bold d-flex align-items-center gap-2"
            onClick={() => {
              handleAdd();
              setShowDetail(false);
            }}
          >
            <FaShoppingCart /> Thêm Vào Giỏ Ngay
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductCard;
