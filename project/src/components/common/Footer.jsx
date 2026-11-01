import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaPaw,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebookF,
  FaYoutube,
  FaTiktok,
  FaInstagram,
  FaShieldAlt,
  FaTruck,
  FaMedkit
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-main">
      <Container>
        <Row className="g-4">
          {/* Brand & Introduction */}
          <Col lg={4} md={6}>
            <div className="footer-brand-title">
              <span className="brand-icon-box" style={{ width: 36, height: 36, fontSize: '1.1rem' }}>
                <FaPaw />
              </span>
              <span>PET SHOP</span>
            </div>
            <p className="text-secondary small mb-3" style={{ lineHeight: '1.7' }}>
              Hệ thống kinh doanh thú cưng thuần chủng uy tín số 1 Việt Nam.
              Chúng tôi cam kết mang tới cho bạn những người bạn 4 chân khỏe mạnh, tiêm chủng đầy đủ
              và đồng hành tư vấn y tế trọn đời.
            </p>
            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex align-items-center gap-2 text-white">
                <FaShieldAlt className="text-warning" />
                <span>Bảo hành sức khỏe toàn diện 365 ngày</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-white">
                <FaMedkit className="text-success" />
                <span>Bác sĩ thú y trực tuyến hỗ trợ 24/7</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-white">
                <FaTruck className="text-info" />
                <span>Vận chuyển an toàn hỏa tốc trên tất cả các tỉnh thành tại Việt Nam</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="social-links-box">
              <a href="#facebook" className="social-icon-btn" title="Facebook">
                <FaFacebookF />
              </a>
              <a href="#youtube" className="social-icon-btn" title="YouTube">
                <FaYoutube />
              </a>
              <a href="#tiktok" className="social-icon-btn" title="TikTok">
                <FaTiktok />
              </a>
              <a href="#instagram" className="social-icon-btn" title="Instagram">
                <FaInstagram />
              </a>
            </div>
          </Col>

          {/* Quick Links & Categories */}
          <Col lg={2} md={6} sm={6}>
            <h5 className="footer-title">Danh Mục</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <a href="#featured-pets">Chó Cảnh Thuần Chủng</a>
              </li>
              <li>
                <a href="#featured-pets">Mèo Cảnh Quý Tộc</a>
              </li>
              <li>
                <a href="#accessories-section">Thức Ăn Hạt & Pate</a>
              </li>
              <li>
                <a href="#accessories-section">Balo & Chuồng Vận Chuyển</a>
              </li>
              <li>
                <a href="#accessories-section">Phụ Kiện & Đồ Chơi</a>
              </li>
              <li>
                <a href="#popular-breeds">Các Giống Thú Cưng</a>
              </li>
            </ul>
          </Col>

          {/* Policies & Warranties */}
          <Col lg={3} md={6} sm={6}>
            <h5 className="footer-title">Chính Sách & Hỗ Trợ</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <a href="#policy-warranty">Chính Sách Bảo Hành Sức Khỏe</a>
              </li>
              <li>
                <a href="#policy-delivery">Quy Trình Vận Chuyển Thú Cưng</a>
              </li>
              <li>
                <a href="#policy-guide">Cẩm Nang Nuôi Dưỡng & Huấn Luyện</a>
              </li>
              <li>
                <a href="#policy-vet">Lịch Tiêm Chủng & Tẩy Giun Định Kỳ</a>
              </li>
              <li>
                <a href="#policy-payment">Hình Thức Thanh Toán Linh Hoạt</a>
              </li>
              <li>
                <a href="#policy-contact">Chính Sách Đổi Trả Sản Phẩm</a>
              </li>
            </ul>
          </Col>

          {/* Store Info & Contact */}
          <Col lg={3} md={6}>
            <h5 className="footer-title">Thông Tin Liên Hệ</h5>
            <div className="footer-contact-item">
              <FaMapMarkerAlt className="footer-contact-icon" />
              <span>
                <strong>Cơ sở Cần Thơ:</strong> 600 NGuyễn Văn Cừ nối dài, Phường An Bình, TP. Cần Thơ
              </span>
            </div>
            <div className="footer-contact-item">
              <FaPhoneAlt className="footer-contact-icon" />
              <span>
                <strong>Hotline:</strong> 0987.654.321 / 0918.352.816
              </span>
            </div>
            <div className="footer-contact-item">
              <FaEnvelope className="footer-contact-icon" />
              <span>
                <strong>Email:</strong> contact@pet.vn
              </span>
            </div>
            <div className="footer-contact-item">
              <FaClock className="footer-contact-icon" />
              <span>
                <strong>Giờ làm việc:</strong> 08:00 - 21:30 (Thứ 2 - Chủ Nhật)
              </span>
            </div>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="mb-0">
            © 2026 Pet Shop - Website Kinh Doanh Thú Cưng & Phụ Kiện. Phát triển với ReactJS & Vite.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
