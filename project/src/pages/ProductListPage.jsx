import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Pagination } from 'react-bootstrap';
import {
  FaPaw,
  FaDog,
  FaCat,
  FaThLarge,
  FaGift,
  FaSearch,
  FaSadTear,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa';

import PetCard from '../components/product/PetCard';
import ProductCard from '../components/product/ProductCard';
import Loading from '../components/common/Loading';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import useFetch from '../hooks/useFetch';
import { normalize, scoreProduct } from '../utils/search';

const PAGE_SIZE = 12;

const TYPE_TABS = [
  { value: 'all', label: 'Tất cả', Icon: FaThLarge },
  { value: 'dog', label: 'Chó', Icon: FaDog },
  { value: 'cat', label: 'Mèo', Icon: FaCat },
  { value: 'accessory', label: 'Phụ kiện', Icon: FaGift }
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'name', label: 'Tên A → Z' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'discount', label: 'Giảm giá nhiều nhất' }
];

const isPet = (p) => p.petType === 'dog' || p.petType === 'cat';

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

function ProductListPage({ onAddToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Toàn bộ bộ lọc nằm trên URL để có thể chia sẻ/quay lại.
  const q = (searchParams.get('q') || '').trim();
  const type = searchParams.get('type') || 'all';
  const categoryId = searchParams.get('category') || '';
  const minPrice = searchParams.get('min') || '';
  const maxPrice = searchParams.get('max') || '';
  const inStockOnly = searchParams.get('stock') === '1';
  const sort = searchParams.get('sort') || 'default';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  const {
    data: products,
    loading,
    error,
    refetch
  } = useFetch(() => productService.getProducts(), []);

  const { data: categories } = useFetch(
    () => categoryService.getCategories(),
    []
  );

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (value === '' || value === null || value === undefined || value === 'all' || value === false) {
      next.delete(key);
    } else {
      next.set(key, value === true ? '1' : value);
    }

    // Đổi bộ lọc thì về trang 1.
    if (key !== 'page') next.delete('page');

    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => setSearchParams({}, { replace: true });

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const handleAddToCart = (product) => {
    const result = onAddToCart?.(product);

    setToastMessage(
      result?.message ||
        (result?.ok === false
          ? 'Không thể thêm sản phẩm vào giỏ hàng.'
          : `Đã thêm "${product.name}" vào giỏ hàng!`)
    );

    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);

    return result;
  };

  // Danh mục hiển thị theo loại đang chọn.
  const visibleCategories = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    if (type === 'all') return list;
    return list.filter((c) => c.petType === type);
  }, [categories, type]);

  const filtered = useMemo(() => {
    const min = toNumberOrNull(minPrice);
    const max = toNumberOrNull(maxPrice);
    const hasQuery = normalize(q) !== '';

    let list = (products || [])
      .map((product) => ({
        product,
        score: hasQuery ? scoreProduct(product, q) : 1
      }))
      .filter(({ product, score }) => {
        if (score <= 0) return false;
        if (type !== 'all' && product.petType !== type) return false;
        if (categoryId && String(product.categoryId) !== String(categoryId)) return false;

        const price = Number(product.price) || 0;
        if (min !== null && price < min) return false;
        if (max !== null && price > max) return false;

        if (inStockOnly && !(Number(product.inStock) > 0)) return false;

        return true;
      });

    list = [...list].sort((a, b) => {
      const pa = a.product;
      const pb = b.product;

      switch (sort) {
        case 'price-asc':
          return Number(pa.price) - Number(pb.price);
        case 'price-desc':
          return Number(pb.price) - Number(pa.price);
        case 'name':
          return String(pa.name).localeCompare(String(pb.name), 'vi');
        case 'rating':
          return Number(pb.rating || 0) - Number(pa.rating || 0);
        case 'discount':
          return Number(pb.discount || 0) - Number(pa.discount || 0);
        default:
          // Có từ khóa thì xếp theo độ liên quan.
          return hasQuery ? b.score - a.score : 0;
      }
    });

    return list.map((item) => item.product);
  }, [products, q, type, categoryId, minPrice, maxPrice, inStockOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasActiveFilter =
    q || type !== 'all' || categoryId || minPrice || maxPrice || inStockOnly || sort !== 'default';

  const goToPage = (p) => {
    setParam('page', p === 1 ? '' : String(p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Rút gọn dãy trang: 1 … 4 5 6 … 10
  const pageNumbers = useMemo(() => {
    const result = [];
    for (let i = 1; i <= totalPages; i += 1) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        result.push(i);
      } else if (result[result.length - 1] !== '…') {
        result.push('…');
      }
    }
    return result;
  }, [totalPages, currentPage]);

  return (
    <main className="search-page">
      <Container>
        <div className="search-page-head">
          <div className="search-page-kicker">
            <FaPaw /> Cửa hàng
          </div>
          <h1 className="search-page-title">Tất cả sản phẩm</h1>
          {!loading && !error && (
            <p className="search-page-count">
              Tìm thấy <strong>{filtered.length}</strong> sản phẩm
            </p>
          )}
        </div>

        {/* Tab loại sản phẩm */}
        <div className="filter-tabs-wrapper">
          {TYPE_TABS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={`filter-tab-btn ${type === value ? 'active' : ''}`}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (value === 'all') next.delete('type');
                else next.set('type', value);
                // Danh mục có thể không còn phù hợp với loại mới.
                next.delete('category');
                next.delete('page');
                setSearchParams(next, { replace: true });
              }}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>

        {/* Thanh bộ lọc */}
        <div className="bg-white rounded-4 shadow-sm p-3 mb-4">
          <Row className="g-3 align-items-end">
            <Col lg={4} md={12}>
              <Form.Label className="small fw-semibold mb-1">Từ khóa</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="Tên, giống, màu, thương hiệu..."
                  value={searchParams.get('q') || ''}
                  onChange={(e) => setParam('q', e.target.value)}
                />
                {searchParams.get('q') && (
                  <Button
                    variant="link"
                    className="position-absolute top-50 end-0 translate-middle-y text-muted"
                    onClick={() => setParam('q', '')}
                    aria-label="Xóa từ khóa"
                  >
                    <FaTimes />
                  </Button>
                )}
              </div>
            </Col>

            <Col lg={3} md={6}>
              <Form.Label className="small fw-semibold mb-1">Danh mục</Form.Label>
              <Form.Select
                value={categoryId}
                onChange={(e) => setParam('category', e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {visibleCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col lg={5} md={6}>
              <Form.Label className="small fw-semibold mb-1">Khoảng giá (₫)</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => setParam('min', e.target.value)}
                />
                <span>—</span>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => setParam('max', e.target.value)}
                />
              </div>
            </Col>

            <Col lg={4} md={6}>
              <Form.Label className="small fw-semibold mb-1">Sắp xếp</Form.Label>
              <Form.Select value={sort} onChange={(e) => setParam('sort', e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col lg={4} md={6}>
              <Form.Check
                type="switch"
                id="in-stock-only"
                label="Chỉ hiện sản phẩm còn hàng"
                checked={inStockOnly}
                onChange={(e) => setParam('stock', e.target.checked)}
              />
            </Col>

            <Col lg={4} md={12} className="text-lg-end">
              {hasActiveFilter && (
                <Button variant="outline-secondary" onClick={resetFilters}>
                  <FaTimes className="me-1" /> Xóa bộ lọc
                </Button>
              )}
            </Col>
          </Row>

          {(minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) && (
            <div className="text-danger small mt-2">
              Giá "Từ" đang lớn hơn giá "Đến" nên sẽ không có kết quả.
            </div>
          )}
        </div>

        {loading && <Loading message="Đang tải sản phẩm..." />}

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

        {!loading && !error && pageItems.length > 0 && (
          <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
            {pageItems.map((item) => (
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

        {!loading && !error && filtered.length === 0 && (
          <div className="search-empty">
            <FaSadTear className="search-empty-icon" />
            <h2 className="h5 fw-bold">Không có sản phẩm phù hợp</h2>
            <p className="text-muted mb-3">
              Hãy thử thay đổi từ khóa, khoảng giá hoặc bỏ bớt bộ lọc.
            </p>
            {hasActiveFilter && (
              <Button variant="warning" className="text-white" onClick={resetFilters}>
                <FaSearch className="me-2" /> Xem tất cả sản phẩm
              </Button>
            )}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              />
              {pageNumbers.map((n, idx) =>
                n === '…' ? (
                  <Pagination.Ellipsis key={`e-${idx}`} disabled />
                ) : (
                  <Pagination.Item
                    key={n}
                    active={n === currentPage}
                    onClick={() => goToPage(n)}
                  >
                    {n}
                  </Pagination.Item>
                )
              )}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              />
            </Pagination>
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
}

export default ProductListPage;
