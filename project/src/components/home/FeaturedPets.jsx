
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaPaw,
  FaDog,
  FaCat,
  FaThLarge,
  FaSearch,
  FaSyncAlt,
} from 'react-icons/fa';

import productService from '../../services/productService';
import PetCard from '../product/PetCard';
import Loading from '../common/Loading';

const FeaturedPets = ({
  searchQuery = '',
  selectedCategory = null,
}) => {
  const [pets, setPets] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Tải danh sách thú cưng theo bộ lọc hiện tại
  useEffect(() => {
    let isMounted = true;

    const fetchPets = async () => {
      try {
        setLoading(true);
        setError(null);

        // Khi tìm kiếm hoặc chọn danh mục chó/mèo,
        // tải tất cả thú cưng, không chỉ sản phẩm nổi bật.
        const shouldLoadAllPets =
          selectedCategory?.petType === 'dog' ||
          selectedCategory?.petType === 'cat' ||
          searchQuery.trim() !== '';

        const data = shouldLoadAllPets
          ? await productService.getPets()
          : await productService.getFeaturedPets(activeFilter);

        if (isMounted) {
          setPets(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load pets:', err);

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
  }, [activeFilter, retryTrigger, selectedCategory, searchQuery]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  // Lọc thú cưng theo danh mục, tab và từ khóa tìm kiếm
  const filteredPets = pets.filter((pet) => {
    // Nếu chọn danh mục chó hoặc mèo, lọc chính xác theo categoryId.
    if (
      selectedCategory &&
      (selectedCategory.petType === 'dog' ||
        selectedCategory.petType === 'cat') &&
      pet.categoryId !== selectedCategory.id
    ) {
      return false;
    }

    // Khi chọn danh mục phụ kiện, không hiển thị thú cưng.
    if (selectedCategory?.petType === 'accessory') {
      return false;
    }

    // Khi không chọn danh mục, áp dụng bộ lọc tab chó/mèo.
    if (
      !selectedCategory &&
      activeFilter !== 'all' &&
      pet.petType !== activeFilter
    ) {
      return false;
    }

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      pet.name,
      pet.color,
      pet.origin,
      pet.description,
      pet.categoryId,
    ].some((value) =>
      value?.toLowerCase().includes(query)
    );
  });

  return (
    <section className="py-5" id="featured-pets">
      <Container>
        {/* Tiêu đề */}
        <div className="text-center mb-4">
          <span className="section-badge">
            <FaPaw /> Thú Cưng Đang Chờ Chủ Mới
          </span>

          <h2 className="section-title">
            Thú Cưng <span>Nổi Bật Nhất</span>
          </h2>

          <p className="section-subtitle">
            Tất cả các bé đều được bác sĩ thú y chứng nhận sức khỏe,
            tiêm phòng 2 mũi vắc-xin, tẩy giun định kỳ và gắn
            microchip định danh trước khi về nhà mới.
          </p>
        </div>

        {/* Bộ lọc chó/mèo */}
        <div className="filter-tabs-wrapper">
          <button
            type="button"
            className={`filter-tab-btn ${
              activeFilter === 'all' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('all')}
          >
            <FaThLarge /> Tất Cả Thú Cưng
          </button>

          <button
            type="button"
            className={`filter-tab-btn ${
              activeFilter === 'dog' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('dog')}
          >
            <FaDog /> Chó Cảnh Thuần Chủng
          </button>

          <button
            type="button"
            className={`filter-tab-btn ${
              activeFilter === 'cat' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('cat')}
          >
            <FaCat /> Mèo Cảnh Quý Tộc
          </button>
        </div>

        {/* Thông báo tìm kiếm */}
        {searchQuery.trim() !== '' && (
          <div className="d-flex justify-content-center mb-4 mt-3">
            <div className="alert alert-light border d-inline-flex align-items-center gap-2 py-2 px-3 rounded-pill small">
              <FaSearch className="text-warning" />

              <span>
                Kết quả tìm kiếm cho từ khóa:{' '}
                <strong>"{searchQuery}"</strong>{' '}
                ({filteredPets.length} kết quả)
              </span>
            </div>
          </div>
        )}

        {/* Đang tải */}
        {loading && (
          <Loading message="Đang tải danh sách thú cưng..." />
        )}

        {/* Lỗi kết nối */}
        {!loading && error && (
          <div className="error-banner flex-column flex-md-row align-items-center text-center text-md-start">
            <div>
              <div className="fw-bold mb-1">{error}</div>

              <div className="small text-muted">
                Khởi động máy chủ bằng lệnh{' '}
                <code>npm run server</code> hoặc chạy lệnh
                khởi động dự án theo cấu hình của bạn.
              </div>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger mt-2 mt-md-0 fw-bold px-3 py-2 text-nowrap d-inline-flex align-items-center gap-2"
              onClick={handleRetry}
            >
              <FaSyncAlt /> Thử Lại Ngay
            </button>
          </div>
        )}

        {/* Không có kết quả */}
        {!loading && !error && filteredPets.length === 0 && (
          <div className="empty-state-box text-center">
            <div className="empty-state-icon">
              <FaPaw />
            </div>

            <h5 className="fw-bold text-dark">
              Chưa có thú cưng nào phù hợp
            </h5>

            <p className="text-muted small">
              Vui lòng thử từ khóa khác hoặc chọn bộ lọc
              "Tất Cả Thú Cưng".
            </p>
          </div>
        )}

        {/* Danh sách thú cưng */}
        {!loading && !error && filteredPets.length > 0 && (
          <Row className="g-4">
            {filteredPets.map((pet) => (
              <Col key={pet.id} xs={12} sm={6} lg={3}>
                <PetCard pet={pet} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default FeaturedPets;
