import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaPaw,
  FaGlobeAsia,
  FaHeartbeat,
  FaShoppingCart,
  FaBolt
} from 'react-icons/fa';
import breedService from '../../services/breedService';
import productService from '../../services/productService';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { addItem, toCartItem } from '../../utils/cartUtils';
import Loading from '../common/Loading';

const PopularBreeds = () => {
  const [breeds, setBreeds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [retryTrigger, setRetryTrigger] = useState(0);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [breedData, productData] = await Promise.all([
          breedService.getBreeds(),
          productService.getProducts()
        ]);
        if (isMounted) {
          setBreeds(breedData);
          setProducts(productData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load breeds:', err);
          setError(err.message || 'Không thể tải danh sách giống thú cưng.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  // Mỗi giống có nhiều bé (productIds). Lấy bé còn hàng đầu tiên để mua.
  const getAvailablePet = (breed) => {
    const ids = (breed.productIds || []).map(String);
    return products.find(
      (p) => ids.includes(String(p.id)) && Number(p.inStock) > 0
    );
  };

  const handleAddToCart = (pet) => {
    const result = addToCart(pet);
    if (result?.ok === false) {
      alert(result.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  // Mua ngay: chỉ thanh toán riêng bé này, KHÔNG đụng tới giỏ hàng.
  // (/checkout đã bọc RequireAuth nên chưa đăng nhập sẽ được đưa tới /login.)
  const handleBuyNow = (pet) => {
    const { result } = addItem([], pet); // chỉ để kiểm tra hợp lệ / còn hàng
    if (!result.ok) {
      alert(result.message || 'Không thể mua sản phẩm này.');
      return;
    }
    navigate('/checkout', { state: { buyNow: toCartItem(pet, 1) } });
  };

  return (
    <section className="py-5" id="popular-breeds">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-5">
          <span className="section-badge">
            <FaPaw /> Thế Giới Thú Cưng
          </span>
          <h2 className="section-title">
            Các Giống Thú Cưng <span>Được Yêu Thích Nhất</span>
          </h2>
          <p className="section-subtitle">
            Khám phá nguồn gốc, đặc điểm tính cách và tuổi thọ của các giống chó mèo nổi tiếng thế giới
            được nhân giống chuẩn thuần chủng tại PetShop.
          </p>
        </div>

        {/* Loading State */}
        {loading && <Loading message="Đang tải danh sách các giống thú cưng..." />}

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

        {/* Breeds Grid */}
        {!loading && !error && (
          <Row className="g-4">
            {breeds.map((breed) => {
              const pet = getAvailablePet(breed);

              return (
                <Col key={breed.id} xs={12} sm={6} lg={3}>
                  <div className="breed-card">
                    <div className="breed-img-box">
                      <span className="breed-badge-type">
                        {breed.petType === 'dog' ? 'Chó Cảnh' : 'Mèo Cảnh'}
                      </span>
                      <img
                        src={breed.image}
                        alt={breed.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>
                    <div className="breed-content">
                      <h5 className="breed-name">{breed.name}</h5>
                      <div className="breed-origin">
                        <FaGlobeAsia className="text-warning" />
                        <span>{breed.origin}</span>
                      </div>
                      <p className="breed-personality">{breed.personality}</p>
                      <div className="mt-auto">
                        <span className="breed-lifespan">
                          <FaHeartbeat className="me-1" /> Tuổi thọ: {breed.lifeSpan}
                        </span>

                        {/* Giá và nút mua */}
                        <div className="mt-3">
                          {pet && (
                            <div className="mb-2">
                              <div className="small text-muted text-truncate" title={pet.name}>
                                {pet.name}
                              </div>
                              <div className="fw-bold text-danger">
                                {formatCurrency(pet.price)}
                              </div>
                            </div>
                          )}

                          <div className="d-flex flex-column gap-2">
                            <button
                              type="button"
                              className="btn btn-card-action btn-cart-accessory"
                              onClick={() => handleAddToCart(pet)}
                              disabled={!pet}
                              title={!pet ? 'Giống này hiện đã hết hàng' : undefined}
                            >
                              <FaShoppingCart className="small" />
                              {pet ? 'Thêm Vào Giỏ' : 'Hết Hàng'}
                            </button>

                            <button
                              type="button"
                              className="btn btn-warning text-white fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2"
                              onClick={() => handleBuyNow(pet)}
                              disabled={!pet}
                              title={
                                !pet
                                  ? 'Giống này hiện đã hết hàng'
                                  : 'Mua ngay và chuyển tới trang thanh toán'
                              }
                            >
                              <FaBolt className="small" />
                              Mua Ngay
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default PopularBreeds;
