import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPaw, FaGlobeAsia, FaHeartbeat } from 'react-icons/fa';
import breedService from '../../services/breedService';
import Loading from '../common/Loading';

const PopularBreeds = () => {
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchBreeds = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await breedService.getBreeds();
        if (isMounted) {
          setBreeds(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load breeds:', err);
          setError(err.message || 'Không thể tải danh sách giống thú cưng.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBreeds();
    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  return (
    <section className="py-5" id="popular-breeds">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-5">
          <span className="section-badge">
            <FaPaw /> Thế Giới Thú Cưng
          </span>
          <h2 className="section-title">
            Các Giống Thú Cưng <span>Được Yêu Thích Nhất</span>
          </h2>
          <p className="section-subtitle">
            Khám phá nguồn gốc, đặc điểm tính cách và tuổi thọ của các giống chó mèo nổi tiếng thế giới
            được nhân giống chuẩn thuần chủng tại PetShop.
          </p>
        </div>

        {/* Loading State */}
        {loading && <Loading message="Đang tải danh sách các giống thú cưng..." />}

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

        {/* Breeds Grid */}
        {!loading && !error && (
          <Row className="g-4">
            {breeds.map((breed) => (
              <Col key={breed.id} xs={12} sm={6} lg={3}>
                <div className="breed-card">
                  <div className="breed-img-box">
                    <span className="breed-badge-type">
                      {breed.petType === 'dog' ? 'Chó Cảnh' : 'Mèo Cảnh'}
                    </span>
                    <img
                      src={breed.image}
                      alt={breed.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                  <div className="breed-content">
                    <h5 className="breed-name">{breed.name}</h5>
                    <div className="breed-origin">
                      <FaGlobeAsia className="text-warning" />
                      <span>{breed.origin}</span>
                    </div>
                    <p className="breed-personality">{breed.personality}</p>
                    <div className="mt-auto">
                      <span className="breed-lifespan">
                        <FaHeartbeat className="me-1" /> Tuổi thọ: {breed.lifeSpan}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default PopularBreeds;
