import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPaw, FaPhoneAlt, FaComments } from 'react-icons/fa';

const CTASection = () => {
  return (
    <section className="py-5" style={{ backgroundColor: '#ffffff' }}>
      <Container>
        <div className="cta-banner-box">
          <Row className="align-items-center">
            <Col lg={8}>
              <span
                className="badge mb-3 px-3 py-2 text-uppercase fw-bold"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  letterSpacing: '1px',
                  borderRadius: '50px'
                }}
              >
                <FaPaw className="me-1" /> Đồng Hành Cùng Hạnh Phúc Của Bạn
              </span>
              <h2 className="cta-title">
                Sẵn Sàng Đón Một Thành Viên Mới Về Tổ Ấm?
              </h2>
              <p className="cta-desc">
                Liên hệ ngay với chuyên viên của Pet Shop để được tư vấn chọn giống thú cưng phù hợp với
                không gian sống và điều kiện gia đình bạn. Hỗ trợ trả góp 0% lãi suất cùng quà tặng trị giá tới 1.500.000 ₫!
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a href="tel:0987654321" className="btn-cta-white">
                  <FaPhoneAlt /> Gọi Hotline: 0987.654.321
                </a>
                <a
                  href="#featured-pets"
                  className="btn btn-outline-light rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
                  style={{ border: '2px solid white' }}
                >
                  <FaPaw /> Xem Danh Sách Thú Cưng
                </a>
              </div>
            </Col>
            <Col lg={4} className="text-center d-none d-lg-block">
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '24px',
                  borderRadius: '30px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <FaComments style={{ fontSize: '5rem', color: '#ffffff' }} />
                <h5 className="text-white fw-bold mt-2 mb-0">Hỗ Trợ 24/7</h5>
                <small className="text-white-50">Tư vấn miễn phí qua Hotline/Zalo</small>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </section>
  );
};

export default CTASection;
