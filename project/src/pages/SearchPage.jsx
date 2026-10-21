import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FaSearch, FaCheckCircle, FaSadTear } from 'react-icons/fa';
import PetCard from '../components/product/PetCard';
import ProductCard from '../components/product/ProductCard';
import Loading from '../components/common/Loading';
import productService from '../services/productService';
import useFetch from '../hooks/useFetch';
import { POPULAR_SEARCHES, searchProducts } from '../utils/search';

const SearchPage = ({ onAddToCart }) => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();

  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  // Lấy toàn bộ sản phẩm một lần rồi lọc phía client (giống cách FeaturedPets đang làm).
  const { data: products, loading, error, refetch } = useFetch(
    () => productService.getProducts(),
    []
  );

  const results = useMemo(
    () => searchProducts(products || [], query),
    [products, query]
  );

  // Mỗi lần đổi từ khóa thì cuộn lên đầu trang.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [query]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const handleAddToCart = (product) => {
    onAddToCart?.(product);
    setToastMessage(`Đã thêm "${product.name}" vào giỏ hàng!`);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  const isPet = (p) => p.petType === 'dog' || p.petType === 'cat';

  return (
    <main className="search-page">
      <Container>
        <div className="search-page-head">
          <div className="search-page-kicker">
            <FaSearch /> Kết quả tìm kiếm
          </div>
          {query ? (
            <>
              <h1 className="search-page-title">“{query}”</h1>
              {!loading && !error && (
                <p className="search-page-count">
                  Tìm thấy <strong>{results.length}</strong> kết quả
                </p>
              )}
            </>
          ) : (
            <h1 className="search-page-title">Bạn muốn tìm gì?</h1>
          )}
        </div>

        {loading && <Loading message="Đang tìm kiếm..." />}

        {!loading && error && (
          <div className="error-banner flex-column flex-md-row align-items-center text-center text-md-start">
            <div>
              <strong>Không thể tải dữ liệu</strong>
              <div className="small">{error}</div>
            </div>
            <button type="button" className="btn btn-warning" onClick={refetch}>
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
            {results.map((item) => (
              <Col key={item.id}>
                {isPet(item) ? (
                  <PetCard pet={item} onAddToCart={handleAddToCart} />
                ) : (
                  <ProductCard product={item} onAddToCart={handleAddToCart} />
                )}
              </Col>
            ))}
          </Row>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="search-empty">
            <FaSadTear className="search-empty-icon" />
            <h2 className="h5 fw-bold">
              {query
                ? 'Chưa tìm thấy kết quả phù hợp'
                : 'Nhập từ khóa để bắt đầu tìm kiếm'}
            </h2>
            <p className="text-muted mb-3">
              Hãy thử từ khóa khác hoặc chọn một gợi ý bên dưới.
            </p>
            <div className="search-chip-list justify-content-center">
              {POPULAR_SEARCHES.map((item) => (
                <Link
                  key={item.label}
                  to={`/search?q=${encodeURIComponent(item.label)}`}
                  className="search-chip"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>

      {toastMessage && (
        <div className="toast-notice" role="status" aria-live="polite">
          <FaCheckCircle className="text-success fs-5" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
};

export default SearchPage;
