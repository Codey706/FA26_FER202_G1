
import React, { useState, useEffect } from 'react';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPaw } from 'react-icons/fa';
import productService from '../../services/productService';
import ProductCard from '../product/ProductCard';
import Loading from '../common/Loading';

const AccessoriesSection = ({
  onAddToCart,
  selectedCategory = null,
  onClearCategory
const ACCESSORY_CATEGORY_IDS = [
  'cat-food',
  'cat-accessories',
  'cat-cages',
];

const AccessoriesSection = ({
  onAddToCart,
  searchQuery = '',
  selectedCategory = null,
}) => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Tải dữ liệu phụ kiện từ API
  useEffect(() => {
    let isMounted = true;

    const fetchAccessories = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await productService.getAccessories();

        if (isMounted) {
          setAccessories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load accessories:', err);
          setError(
            err.message || 'Không thể tải danh sách phụ kiện từ máy chủ.'
          );
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

  // Lọc theo danh mục và từ khóa
  const filteredAccessories = accessories.filter((item) => {
    const selectedId = selectedCategory?.id;

    const selectedIsAccessory =
      selectedCategory?.petType === 'accessory' ||
      ACCESSORY_CATEGORY_IDS.includes(selectedId);

    // Đang chọn chó/mèo thì không hiển thị phụ kiện
    if (selectedCategory && !selectedIsAccessory) {
      return false;
    }

    // Đang chọn một danh mục phụ kiện cụ thể
    if (
      selectedIsAccessory &&
      item.categoryId !== selectedId
    ) {
      return false;
    }

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      item.name,
      item.description,
      item.brand,
      item.type,
      item.categoryId,
    ].some((value) =>
      String(value ?? '').toLowerCase().includes(query)
    );
  });

  return (
    <section
      className="py-5"
      id="accessories-section"
      style={{ backgroundColor: '#fffdfa' }}
    >
      <Container>
        <div className="text-center mb-5">
          <span className="section-badge">
            <FaPaw /> Phụ Kiện &amp; Dinh Dưỡng
          </span>

          <h2 className="section-title">
            {!selectedCategory
              ? <>Phụ Kiện Thú Cưng <span>Chính Hãng</span></>
              : selectedCategory.id === 'cat-food'
                ? <>Thức Ăn <span>Thú Cưng</span></>
                : selectedCategory.id === 'cat-cages'
                  ? <>Chuồng Nệm <span>& Vận Chuyển</span></>
                  : selectedCategory.id === 'cat-accessories'
                    ? <>Phụ Kiện <span>& Đồ Chơi</span></>
                    : <>Phụ Kiện Thú Cưng <span>Chính Hãng</span></>
            }
          </h2>

          <p className="section-subtitle">
            Cung cấp thức ăn dinh dưỡng, đồ chơi, balo vận chuyển
            và chuồng nệm giúp thú cưng phát triển khỏe mạnh.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <Loading message="Đang tải danh sách phụ kiện chính hãng..." />
        )}

        {!loading && error && (
          <div className="error-banner flex-column flex-md-row align-items-center text-center text-md-start">
            <div>{error}</div>

            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => setRetryTrigger((prev) => prev + 1)}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Accessories Grid */}
        {!loading && !error && filteredAccessories.length > 0 && (
          <Row className="g-4">
            {filteredAccessories.map((item) => (
              <Col key={item.id} xs={12} sm={6} lg={3}>
                <ProductCard
                  product={item}
                  onAddToCart={onAddToCart}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAccessories.length === 0 && (
          <div className="empty-state-box text-center">
            <div className="empty-state-icon">
              <FaPaw />
            </div>

            <h5 className="fw-bold text-dark">
              Không có sản phẩm trong danh mục này
            </h5>

            <p className="text-muted small">
              Hãy chọn danh mục khác để xem thêm sản phẩm.
            </p>

            {selectedCategory && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClearCategory}
              >
                Xem tất cả phụ kiện
              </button>
            )}
          </div>
        )}
      </Container>
    </section>
  );
};

export default AccessoriesSection;