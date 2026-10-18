import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPaw, FaStar, FaCheckCircle, FaQuoteLeft } from 'react-icons/fa';
import reviewService from '../../services/reviewService';
import Loading from '../common/Loading';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await reviewService.getReviews();
        if (isMounted) {
          setReviews(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load reviews:', err);
          setError(err.message || 'Không thể tải đánh giá khách hàng.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  return (
    <section className="py-5" id="testimonials" style={{ backgroundColor: '#fff9f2' }}>
      <Container>
        {/* Section Header */}
        <div className="text-center mb-5">
          <span className="section-badge">
            <FaPaw /> Khách Hàng Nói Gì?
          </span>
          <h2 className="section-title">
            Trải Nghiệm Của <span>Gia Đình PetShop</span>
          </h2>
          <p className="section-subtitle">
            Hàng ngàn gia đình đã tin tưởng đón các bé cún, mèo tại Pet Shop. Sự hài lòng và niềm hạnh phúc
            của khách hàng chính là động lực lớn nhất của chúng tôi.
          </p>
        </div>

        {/* Loading State */}
        {loading && <Loading message="Đang tải đánh giá khách hàng..." />}

        {/* Error State */}
        {!loading && error && (
          <div className="error-banner flex-column flex-md-row align-items-center text-center text-md-start">
            <div>{error}</div>
            <button
              className="btn btn-sm btn-outline-danger mt-2 mt-md-0 fw-bold px-3 py-2 text-nowrap"
              onClick={() => setRetryTrigger((prev) => prev + 1)}
            >
              Thử Lại
            </button>
          </div>
        )}

        {/* Reviews Grid */}
        {!loading && !error && (
          <Row className="g-4">
            {reviews.map((rev) => (
              <Col key={rev.id} xs={12} md={4}>
                <div className="review-card">
                  <div className="review-header">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="review-avatar"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                    <div>
                      <h6 className="review-user-name">{rev.userName}</h6>
                      {rev.verified && (
                        <span className="review-verified">
                          <FaCheckCircle /> Đã đón thú cưng
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="review-stars">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="review-comment">"{rev.comment}"</p>

                  {/* Pet Tag */}
                  {rev.petOrProductName && (
                    <div className="review-pet-tag">
                      <FaPaw className="me-1" /> Bé đã đón: <strong>{rev.petOrProductName}</strong>
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default Testimonials;
