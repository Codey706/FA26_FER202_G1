
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPaw } from 'react-icons/fa';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import Loading from '../common/Loading';

const CategorySection = ({ onSelectCategory }) => {
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
          setError(err.message || 'Không thể tải danh mục từ máy chủ.');
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

  const handleCategoryClick = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }

    const targetId =
      category.petType === 'accessory'
        ? 'accessories-section'
        : 'featured-pets';

    document.getElementById(targetId)?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <Container className="my-5">
        <Loading message="Đang tải danh mục thú cưng & phụ kiện..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <div className="error-banner flex-column flex-md-row align-items-center text-center text-md-start">
          <div>{error}</div>
          <button
            className="btn btn-sm btn-outline-danger mt-2 mt-md-0 fw-bold px-3 py-2 text-nowrap"
            onClick={() => setRetryTrigger((prev) => prev + 1)}
          >
            Thử Lại
          </button>
        </div>
      </Container>
    );
  }

  return (
    <section
      className="py-5"
      id="categories"
      style={{ backgroundColor: '#fffdfa' }}
    >
      <Container>
        <div className="text-center mb-5">
          <span className="section-badge">
            <FaPaw /> Danh Mục Nổi Bật
          </span>

          <h2 className="section-title">
            Khám Phá Theo <span>Danh Mục</span>
          </h2>

          <p className="section-subtitle">
            Hàng trăm bé thú cưng thuần chủng và phụ kiện chính hãng, được phân loại
            khoa học để bạn dễ dàng lựa chọn người bạn 4 chân phù hợp nhất.
          </p>
        </div>

        <Row className="g-4 justify-content-center">
          {categories.map((cat) => {
            const itemCount = products.filter(
              (product) => String(product.categoryId) === String(cat.id)
            ).length;

            return (
              <Col key={cat.id} xs={6} md={4} lg={true} className="col-lg">
                <div
                  className="category-card"
                  onClick={() => handleCategoryClick(cat)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleCategoryClick(cat);
                    }
                  }}
                >
                  <div className="category-img-box">
                    <img src={cat.image} alt={cat.name} loading="lazy" />
                  </div>

                  <h6 className="category-name">{cat.name}</h6>
                  <span className="category-count">
                    {itemCount} sản phẩm
                  </span>
                </div>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default CategorySection;
