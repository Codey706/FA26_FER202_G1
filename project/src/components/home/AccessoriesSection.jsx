import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPaw } from 'react-icons/fa';
import productService from '../../services/productService';
import ProductCard from '../product/ProductCard';
import Loading from '../common/Loading';

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
            err.message || 'Không thể tải danh sách phụ kiện.'
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
            Phụ Kiện Thú Cưng <span>Chính Hãng</span>
          </h2>

          <p className="section-subtitle">
            Cung cấp thức ăn dinh dưỡng, đồ chơi, balo vận chuyển
            và chuồng nệm giúp thú cưng phát triển khỏe mạnh.
          </p>
        </div>

        {loading && (
          <Loading message="Đang tải danh sách phụ kiện..." />
        )}

        {!loading && error && (
          <div className="text-center py-4">
            <p className="text-danger">{error}</p>

            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => setRetryTrigger((prev) => prev + 1)}
            >
              Thử lại
            </button>
          </div>
        )}

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

        {!loading && !error && filteredAccessories.length === 0 && (
          <p className="text-center text-muted py-4">
            {selectedCategory || searchQuery.trim()
              ? 'Không tìm thấy sản phẩm phù hợp.'
              : 'Chưa có phụ kiện nào để hiển thị.'}
          </p>
        )}
      </Container>
    </section>
  );
};

export default AccessoriesSection;