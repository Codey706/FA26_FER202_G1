import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPaw, FaDog, FaCat, FaThLarge, FaSearch, FaSyncAlt } from 'react-icons/fa';
import productService from '../../services/productService';
import PetCard from '../product/PetCard';
import Loading from '../common/Loading';

const FeaturedPets = ({ searchQuery = '', onAddToCart }) => {
  const [pets, setPets] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'dog' | 'cat'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Fetch pets whenever filter or retryTrigger changes
  useEffect(() => {
    let isMounted = true;

    const fetchPets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getFeaturedPets(activeFilter);
        if (isMounted) {
          setPets(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load featured pets:', err);
          setError(
            err.message ||
              'Không thể kết nối đến JSON Server. Vui lòng kiểm tra cổng 3001.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPets();

    return () => {
      isMounted = false;
    };
  }, [activeFilter, retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  // Client-side search filtering if user typed in header
  const filteredPets = pets.filter((pet) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      pet.name?.toLowerCase().includes(query) ||
      pet.color?.toLowerCase().includes(query) ||
      pet.origin?.toLowerCase().includes(query) ||
      pet.description?.toLowerCase().includes(query)
    );
  });

  return (
    <section className="py-5" id="featured-pets">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-4">
          <span className="section-badge">
            <FaPaw /> Thú Cưng Đang Chờ Chủ Mới
          </span>
          <h2 className="section-title">
            Thú Cưng <span>Nổi Bật Nhất</span>
          </h2>
          <p className="section-subtitle">
            Tất cả các bé đều được bác sĩ thú y chứng nhận sức khỏe, tiêm phòng 2 mũi vắc-xin,
            tẩy giun định kỳ và gắn microchip định danh trước khi về nhà mới.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs-wrapper">
          <button
            type="button"
            className={`filter-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <FaThLarge /> Tất Cả Thú Cưng
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${activeFilter === 'dog' ? 'active' : ''}`}
            onClick={() => setActiveFilter('dog')}
          >
            <FaDog /> Chó Cảnh Thuần Chủng
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${activeFilter === 'cat' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cat')}
          >
            <FaCat /> Mèo Cảnh Quý Tộc
          </button>
        </div>

        {/* Search Query Indicator */}
        {searchQuery && (
          <div className="d-flex justify-content-center mb-4">
            <div className="alert alert-light border d-inline-flex align-items-center gap-2 py-2 px-3 rounded-pill small">
              <FaSearch className="text-warning" />
              <span>
                Kết quả tìm kiếm cho từ khóa: <strong>"{searchQuery}"</strong> (
                {filteredPets.length} kết quả)
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <Loading message="Đang tải danh sách thú cưng nổi bật..." />}

        {/* Error State with Instructions and Retry */}
        {!loading && error && (
          <div className="error-banner flex-column flex-md-row align-items-center text-center text-md-start">
            <div>
              <div className="fw-bold mb-1">{error}</div>
              <div className="small text-muted">
                Khởi động máy chủ: Mở terminal chạy <code>npm run server</code> (hoặc <code>npm start</code> để chạy cùng lúc cả Server và Web).
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline-danger mt-2 mt-md-0 fw-bold px-3 py-2 text-nowrap d-inline-flex align-items-center gap-2"
              onClick={handleRetry}
            >
              <FaSyncAlt /> Thử Lại Ngay
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPets.length === 0 && (
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <FaPaw />
            </div>
            <h5 className="fw-bold text-dark">Chưa có thú cưng nào phù hợp</h5>
            <p className="text-muted small">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn bộ lọc "Tất Cả Thú Cưng".
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredPets.length > 0 && (
          <Row className="g-4">
            {filteredPets.map((pet) => (
              <Col key={pet.id} xs={12} sm={6} lg={3}>
                <PetCard pet={pet} onAddToCart={onAddToCart} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default FeaturedPets;
