import React, { useState, useEffect } from 'react';
import { Container, Carousel, Row, Col, Badge } from 'react-bootstrap';
import {
  FaPaw,
  FaArrowRight,
  FaPhoneAlt,
  FaHeart,
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa';
import bannerService from '../../services/bannerService';
import Loading from '../common/Loading';

const HeroBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const data = await bannerService.getBanners();
        setBanners(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load banners:', err);
        setError('Không thể tải banner từ máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <Container className="my-4">
        <Loading message="Đang tải banner khuyến mãi..." />
      </Container>
    );
  }

  if (error || !banners.length) {
    // If server error or empty banners, render fallback hero banner
    return (
      <Container className="my-4" id="home">
        <div className="hero-slide-wrapper">
          <Row className="align-items-center w-100 g-4">
            <Col lg={7} className="hero-slide-content">
              <span className="hero-badge">
                <FaPaw /> Ưu Đãi Tháng Này • Giảm Đến 15%
              </span>
              <h1 className="hero-title">
                Thiên Đường Thú Cưng Thuần Chủng Số 1 Việt Nam
              </h1>
              <p className="hero-desc">
                Cung cấp các giống chó cảnh, mèo cảnh thuần chủng được kiểm tra y tế nghiêm ngặt,
                tiêm phòng đầy đủ và bảo hành sức khỏe trọn gói 365 ngày.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a href="#featured-pets" className="btn-primary-orange">
                  Khám Phá Ngay <FaArrowRight />
                </a>
                <a href="tel:0987654321" className="btn-outline-orange">
                  <FaPhoneAlt /> Tư Vấn Miễn Phí
                </a>
              </div>
            </Col>
            <Col lg={5} className="hero-img-box">
              <img
                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80"
                alt="Pet Shop Hero"
                className="hero-main-img"
              />
            </Col>
          </Row>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-4" id="home">
      <Carousel className="hero-carousel" interval={6000} pause="hover">
        {banners.map((banner) => (
          <Carousel.Item key={banner.id}>
            <div className="hero-slide-wrapper">
              <Row className="align-items-center w-100 g-4">
                <Col lg={7} className="hero-slide-content">
                  {banner.badge && (
                    <span className="hero-badge">
                      <FaPaw /> {banner.badge}
                    </span>
                  )}
                  <h1 className="hero-title">{banner.title}</h1>
                  <p className="hero-desc">{banner.description}</p>

                  <div className="d-flex flex-wrap gap-3">
                    <a href={banner.buttonLink || '#featured-pets'} className="btn-primary-orange">
                      {banner.buttonText || 'Khám Phá Thú Cưng'} <FaArrowRight />
                    </a>
                    {banner.secondaryButtonText && (
                      <a
                        href={banner.secondaryButtonLink || 'tel:0987654321'}
                        className="btn-outline-orange"
                      >
                        <FaPhoneAlt /> {banner.secondaryButtonText}
                      </a>
                    )}
                  </div>

                  {banner.highlightStats && banner.highlightStats.length > 0 && (
                    <div className="hero-stats-row">
                      {banner.highlightStats.map((stat, idx) => (
                        <div key={idx} className="hero-stat-item">
                          <h4>{stat.number}</h4>
                          <p>{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Col>

                <Col lg={5} className="hero-img-box">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="hero-main-img"
                  />
                  <div className="hero-floating-card">
                    <div
                      className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center"
                      style={{ width: 38, height: 38, fontSize: '1.1rem' }}
                    >
                      <FaHeart />
                    </div>
                    <div>
                      <div className="fw-bold small text-dark">Bảo Hành Sức Khỏe</div>
                      <div className="text-success small fw-semibold">
                        <FaShieldAlt className="me-1" /> 365 Ngày Toàn Diện
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  );
};

export default HeroBanner;
