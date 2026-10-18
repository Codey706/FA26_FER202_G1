import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPaw } from 'react-icons/fa';
import productService from '../../services/productService';
import ProductCard from '../product/ProductCard';
import Loading from '../common/Loading';

const AccessoriesSection = ({ onAddToCart }) => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchAccessories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getAccessories();
        if (isMounted) {
          setAccessories(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load accessories:', err);
          setError(err.message || 'Không thể tải danh sách phụ kiện từ máy chủ.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAccessories();
    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  return (
    <section className="py-5" id="accessories-section" style={{ backgroundColor: '#fffdfa' }}>
      <Container>
        {/* Section Header */}
        <div className="text-center mb-5">
          <span className="section-badge">
            <FaPaw /> Phụ Kiện & Dinh Dưỡng
          </span>
          <h2 className="section-title">
            Phụ Kiện Thú Cưng <span>Chính Hãng</span>
          </h2>
          <p className="section-subtitle">
            Cung cấp đầy đủ thức ăn dinh dưỡng nhập khẩu, đồ chơi giải trí, balo phi hành gia
            và đệm nằm ấm áp giúp các bé cưng phát triển khỏe mạnh toàn diện.
          </p>
        </div>

        {/* Loading State */}
        {loading && <Loading message="Đang tải danh sách phụ kiện chính hãng..." />}

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

        {/* Accessories Grid */}
        {!loading && !error && (
          <Row className="g-4">
            {accessories.map((item) => (
              <Col key={item.id} xs={12} sm={6} lg={3}>
                <ProductCard product={item} onAddToCart={onAddToCart} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default AccessoriesSection;
