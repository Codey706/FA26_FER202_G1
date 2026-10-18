import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaPaw,
  FaShieldAlt,
  FaCertificate,
  FaUserMd,
  FaShippingFast
} from 'react-icons/fa';

const benefits = [
  {
    icon: <FaCertificate />,
    title: '100% Thuần Chủng & Rõ Nguồn Gốc',
    description:
      'Tất cả các bé cún, mèo đều sinh sản từ bố mẹ thuần chủng, có hợp đồng mua bán và giấy chứng nhận gia phả minh bạch.'
  },
  {
    icon: <FaShieldAlt />,
    title: 'Bảo Hành Sức Khỏe 365 Ngày',
    description:
      'Chính sách bảo hành y tế toàn diện dài nhất Việt Nam, cam kết đồng hành và xử lý triệt để các vấn đề sức khỏe của bé.'
  },
  {
    icon: <FaUserMd />,
    title: 'Bác Sĩ Thú Y Hỗ Trợ Trọn Đời',
    description:
      'Đội ngũ y bác sĩ giàu chuyên môn luôn sẵn sàng tư vấn dinh dưỡng, cách nuôi dạy và hỗ trợ khám bệnh 24/7 hoàn toàn miễn phí.'
  },
  {
    icon: <FaShippingFast />,
    title: 'Vận Chuyển An Toàn Toàn Quốc',
    description:
      'Giao thú cưng bằng xe chuyên dụng điều hòa mát mẻ, có nhân viên chăm sóc suốt hành trình, cam kết bé khỏe mạnh khi tới tay chủ.'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-5" style={{ backgroundColor: '#fff9f2' }}>
      <Container>
        {/* Section Header */}
        <div className="text-center mb-5">
          <span className="section-badge">
            <FaPaw /> Uy Tín Hàng Đầu
          </span>
          <h2 className="section-title">
            Tại Sao Nên Chọn <span>Pet Shop?</span>
          </h2>
          <p className="section-subtitle">
            Chúng tôi hiểu rằng thú cưng không chỉ là vật nuôi mà là một thành viên thân yêu trong gia đình.
            Mọi tiêu chuẩn chăm sóc tại Pet Shop đều hướng tới sự an tâm tuyệt đối của khách hàng.
          </p>
        </div>

        {/* 4 Benefits Grid */}
        <Row className="g-4">
          {benefits.map((item, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <div className="why-card">
                <div className="why-icon-box">{item.icon}</div>
                <h5 className="why-title">{item.title}</h5>
                <p className="why-desc">{item.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default WhyChooseUs;
