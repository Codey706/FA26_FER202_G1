
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaPaw,
  FaDog,
  FaCat,
  FaThLarge,
  FaSearch,
  FaSyncAlt
} from 'react-icons/fa';

import productService from '../../services/productService';
import PetCard from '../product/PetCard';
import Loading from '../common/Loading';

const FeaturedPets = ({
  searchQuery = '',
  selectedCategory = null,
  onClearCategory,
  onAddToCart
}) => {
  const [pets, setPets] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const petsListRef = useRef(null);

  // Chỉ cập nhật bộ lọc thú cưng khi chọn danh mục chó hoặc mèo.
  // Chọn danh mục phụ kiện thì giữ nguyên bộ lọc thú cưng hiện tại.
  useEffect(() => {
    if (
      selectedCategory?.petType === 'dog' ||
      selectedCategory?.petType === 'cat'
    ) {
      setActiveFilter(selectedCategory.petType);
    }
  }, [selectedCategory]);

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
    // Chỉ lọc thú cưng khi chọn danh mục chó hoặc mèo.
    const isPetCategory =
      selectedCategory?.petType === 'dog' ||
      selectedCategory?.petType === 'cat';

    if (
      isPetCategory &&
      String(pet.categoryId) !== String(selectedCategory.id)
    ) {
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

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        pet.name?.toLowerCase().includes(query) ||
        pet.color?.toLowerCase().includes(query) ||
        pet.origin?.toLowerCase().includes(query) ||
        pet.description?.toLowerCase().includes(query);

      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });

  // Reset về trang đầu khi thay đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(0);
  }, [activeFilter, selectedCategory, searchQuery]);

  // Phân trang: mỗi trang hiển thị 8 sản phẩm
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredPets.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentPets = filteredPets.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Cuộn đến danh sách khi chuyển trang
  const scrollToPetsList = () => {
    requestAnimationFrame(() => {
      if (petsListRef.current) {
        const top =
          petsListRef.current.getBoundingClientRect().top +
          window.scrollY - 120;

        window.scrollTo({
          top: Math.max(0, top),
          behavior: 'smooth'
        });
      }
    });
  };

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
            className={`filter-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('all');
              onClearCategory?.();
            }}
          >
            <FaThLarge /> Tất Cả Thú Cưng
          </button>

          <button
            type="button"
            className={`filter-tab-btn ${activeFilter === 'dog' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('dog');
              onClearCategory?.();
            }}
          >
            <FaDog /> Chó Cảnh Thuần Chủng
          </button>

          <button
            type="button"
            className={`filter-tab-btn ${activeFilter === 'cat' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('cat');
              onClearCategory?.();
            }}
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

        {/* Loading State */}
        {loading && (
          <Loading message="Đang tải danh sách thú cưng..." />
        )}

        {/* Error State */}
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

        {/* Products Grid - 8 sản phẩm mỗi trang */}
        {!loading && !error && filteredPets.length > 0 && (
          <>
            <Row className="g-4" ref={petsListRef}>
              {currentPets.map((pet) => (
                <Col key={pet.id} xs={12} sm={6} lg={3}>
                  <PetCard
                    pet={pet}
                    onAddToCart={onAddToCart}
                  />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                <button
                  type="button"
                  className="btn btn-link p-1"
                  disabled={currentPage === 0}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(0, prev - 1));
                    scrollToPetsList();
                  }}
                  aria-label="Trang trước"
                  style={{
                    color: currentPage === 0 ? '#ccc' : '#f4a261',
                    textDecoration: 'none',
                    opacity: currentPage === 0 ? 0.5 : 1,
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>❮</span>
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setCurrentPage(index);
                      scrollToPetsList();
                    }}
                    aria-label={`Trang ${index + 1}`}
                    style={{
                      width: '10px',
                      height: '10px',
                      padding: 0,
                      border: 'none',
                      borderRadius: '50%',
                      backgroundColor:
                        currentPage === index ? '#f4a261' : '#d6d6d6',
                      cursor: 'pointer'
                    }}
                  />
                ))}

                <button
                  type="button"
                  className="btn btn-link p-1"
                  disabled={currentPage === totalPages - 1}
                  onClick={() => {
                    setCurrentPage((prev) =>
                      Math.min(totalPages - 1, prev + 1)
                    );
                    scrollToPetsList();
                  }}
                  aria-label="Trang tiếp theo"
                  style={{
                    color:
                      currentPage === totalPages - 1 ? '#ccc' : '#f4a261',
                    textDecoration: 'none',
                    opacity: currentPage === totalPages - 1 ? 0.5 : 1,
                    cursor:
                      currentPage === totalPages - 1
                        ? 'not-allowed'
                        : 'pointer'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>❯</span>
                </button>
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
};

export default FeaturedPets;
