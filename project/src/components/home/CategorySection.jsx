
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPaw, FaCheckCircle } from 'react-icons/fa';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import Loading from '../common/Loading';

const ACCESSORY_CATEGORY_IDS = [
  'cat-food',
  'cat-accessories',
  'cat-cages',
];

const CATEGORY_IMAGES = {
  'cat-dogs': '/images/categories/dogs.jpg',
  'cat-cats': '/images/categories/cats.jpg',
  'cat-food': '/images/categories/food.jpg',
  'cat-accessories': '/images/categories/accessories.jpg',
  'cat-cages': '/images/categories/cages.jpg',
};

const CategorySection = ({
  onSelectCategory,
  selectedCategory = null,
}) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoryData, productData] = await Promise.all([
          categoryService.getCategories(),
          productService.getProducts()
        ]);

        if (isMounted) {
          setCategories(categoryData);
          setProducts(productData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load categories:', err);
          setError(
            err.message || 'Không thể tải danh mục sản phẩm.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  const isAccessoryCategory = (category) =>
    category?.petType === 'accessory' ||
    ACCESSORY_CATEGORY_IDS.includes(category?.id);

  const handleCategoryClick = (category) => {
    const isSelected = selectedCategory?.id === category.id;
    const nextCategory = isSelected ? null : category;

    onSelectCategory?.(nextCategory);

    const targetId = isAccessoryCategory(category)
      ? 'accessories-section'
      : 'featured-pets';

    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <section
      className="py-5"
      id="categories"
      style={{ backgroundColor: '#fffdfa' }}
    >
      <Container>
        <div className="text-center mb-5">
          <span className="section-badge">
            <FaPaw /> DANH MỤC
          </span>

          <h2 className="section-title">
            Khám Phá <span>Danh Mục</span>
          </h2>

          <p className="section-subtitle">
            Chọn danh mục để tìm sản phẩm phù hợp với thú cưng của bạn.
          </p>
        </div>


        {loading && (
          <Loading message="Đang tải danh mục..." />
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

        {!loading && !error && categories.length === 0 && (
          <p className="text-center text-muted py-4">
            Chưa có danh mục sản phẩm.
          </p>
        )}

        {!loading && !error && categories.length > 0 && (
          <Row className="g-4">
            {categories.map((category) => {
              const active =
                selectedCategory?.id != null &&
                String(selectedCategory.id) === String(category.id);

              // Ưu tiên ảnh từ API, sau đó dùng đường dẫn dự phòng.
              const imageSrc =
                category.image ||
                category.imageUrl ||
                category.imageURL ||
                CATEGORY_IMAGES[category.id];

              return (
                <Col
                  key={category.id}
                  xs={12}
                  sm={6}
                  lg={4}
                >
                  <button
                    type="button"
                    className={`category-card w-100 h-100 ${active ? 'active' : ''
                      }`}
                    onClick={() => handleCategoryClick(category)}
                    aria-pressed={active}
                  >
                    <div className="category-card-content">
                      <div className="category-image-wrapper">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={category.name}
                            className="category-image"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                              event.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}

                        <div
                          className="category-image-fallback"
                          style={{
                            display: imageSrc ? 'none' : 'flex',
                          }}
                        >
                          <FaPaw />
                        </div>
                      </div>

                      <div className="category-info">
                        <h5>{category.name}</h5>

                        <p>
                          {products.filter(
                            (product) =>
                              String(product.categoryId) === String(category.id)
                          ).length} sản phẩm
                        </p>
                      </div>

                      {active && (
                        <FaCheckCircle className="category-check" />
                      )}
                    </div>
                  </button>
                </Col>
              );
            })}
          </Row>
        )}

        {selectedCategory && (
          <div className="text-center mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => onSelectCategory?.(null)}
            >
              Bỏ chọn danh mục
            </button>
          </div>
        )}
      </Container>
    </section>
  );
};

export default CategorySection;