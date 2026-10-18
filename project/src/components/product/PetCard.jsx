import React, { useState } from 'react';
import { Badge, Modal, Button } from 'react-bootstrap';
import {
  FaHeart,
  FaStar,
  FaShieldAlt,
  FaSyringe,
  FaPaw,
  FaPhoneAlt,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_FALLBACK_IMG =
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';

const PetCard = ({ pet }) => {
  const [showModal, setShowModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imgSrc, setImgSrc] = useState(pet.image || DEFAULT_FALLBACK_IMG);

  if (!pet) return null;

  const isMale = pet.gender?.toLowerCase() === 'đực';

  return (
    <>
      <div className="pet-card">
        {/* Thumbnail Box */}
        <div className="pet-card-thumb">
          {pet.discount > 0 && (
            <span className="badge-tag-discount">-{pet.discount}%</span>
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

          {/* Like Heart Button */}
          <button
            type="button"
            className="btn btn-sm position-absolute"
            style={{
              bottom: 12,
              right: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              color: isLiked ? '#ef4444' : '#64748b',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onClick={() => setIsLiked(!isLiked)}
            title={isLiked ? 'Đã yêu thích' : 'Yêu thích'}
          >
            <FaHeart />
          </button>
        </div>

        {/* Card Body */}
        <div className="pet-card-body">
          {/* Rating & Review */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-1 text-warning small">
              <FaStar />
              <strong className="text-dark ms-1">{pet.rating || 5.0}</strong>
              <span className="text-muted">({pet.reviewCount || 10})</span>
            </div>
            <span className="badge bg-light text-secondary border small">
              {pet.petType === 'dog' ? 'Chó Cảnh' : 'Mèo Cảnh'}
            </span>
          </div>

          {/* Pet Name */}
          <h5 className="pet-card-title" title={pet.name}>
            {pet.name}
          </h5>

          {/* Meta Tags */}
          <div className="pet-meta-row">
            {pet.age && (
              <span className="pet-meta-tag">
                <FaPaw className="text-warning" />
                {pet.age}
              </span>
            )}
            {pet.color && (
              <span className="pet-meta-tag text-truncate" style={{ maxWidth: 140 }}>
                {pet.color}
              </span>
            )}
            {pet.healthCheck && (
              <span className="pet-meta-tag text-success">
                <FaShieldAlt /> Sức khỏe tốt
              </span>
            )}
          </div>

          {/* Price Section */}
          <div className="pet-price-box">
            <div>
              <div className="current-price">{formatCurrency(pet.price)}</div>
              {pet.originalPrice && pet.originalPrice > pet.price && (
                <div className="original-price">
                  {formatCurrency(pet.originalPrice)}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pet-card-actions">
            <button
              type="button"
              className="btn btn-card-action btn-contact-pet"
              onClick={() => setShowModal(true)}
            >
              <FaPhoneAlt className="small" />
              Tư Vấn Đón Bé
            </button>
          </div>
        </div>
      </div>

      {/* Detail / Adoption Inquiry Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <FaPaw className="text-warning" />
            <span>Thông Tin Chi Tiết Thú Cưng</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="row g-4 align-items-center">
            <div className="col-md-5 text-center">
              <img
                src={imgSrc}
                alt={pet.name}
                className="img-fluid rounded-4 shadow-sm"
                style={{ maxHeight: 280, width: '100%', objectFit: 'cover' }}
              />
              <div className="mt-3">
                <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                  Tình trạng: Sẵn sàng về nhà mới
                </span>
              </div>
            </div>
            <div className="col-md-7">
              <h4 className="fw-bold text-dark mb-2">{pet.name}</h4>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-danger fs-6 px-3 py-2 rounded-pill">
                  {formatCurrency(pet.price)}
                </span>
                {pet.originalPrice && (
                  <span className="text-muted text-decoration-line-through small">
                    {formatCurrency(pet.originalPrice)}
                  </span>
                )}
              </div>

              <div className="bg-light p-3 rounded-3 mb-3 small">
                <div className="row g-2">
                  <div className="col-6">
                    <strong>Giống:</strong>{' '}
                    {pet.petType === 'dog' ? 'Chó thuần chủng' : 'Mèo thuần chủng'}
                  </div>
                  <div className="col-6">
                    <strong>Giới tính:</strong> {pet.gender || 'Đực/Cái'}
                  </div>
                  <div className="col-6">
                    <strong>Độ tuổi:</strong> {pet.age}
                  </div>
                  <div className="col-6">
                    <strong>Màu sắc:</strong> {pet.color}
                  </div>
                  <div className="col-12">
                    <strong>Tiêm phòng:</strong>{' '}
                    <span className="text-success fw-bold">
                      <FaSyringe className="me-1" />
                      {pet.vaccinated || 'Đã tiêm phòng đầy đủ'}
                    </span>
                  </div>
                  <div className="col-12">
                    <strong>Nguồn gốc:</strong> {pet.origin}
                  </div>
                </div>
              </div>

              <p className="text-muted small mb-3">{pet.description}</p>

              <div className="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-0">
                <FaCheckCircle className="text-success flex-shrink-0" />
                <span>
                  Bảo hành 365 ngày + Tặng kèm gói phụ kiện và thức ăn khi đón bé!
                </span>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4"
            onClick={() => setShowModal(false)}
          >
            Đóng
          </Button>
          <a
            href="tel:0987654321"
            className="btn btn-warning text-white fw-bold rounded-pill px-4 d-inline-flex align-items-center gap-2"
          >
            <FaPhoneAlt /> Gọi Hotline 0987.654.321
          </a>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PetCard;
