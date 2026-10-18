import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaPaw,
  FaSearch,
  FaVideo,
  FaFileContract,
  FaHome
} from 'react-icons/fa';

const steps = [
  {
    step: '01',
    icon: <FaSearch />,
    title: 'Chọn Bé Cưng & Phụ Kiện',
    description:
      'Duyệt xem hình ảnh thực tế, video và thông tin chi tiết từng bé cún, mèo trên website hoặc tại cửa hàng.'
  },
  {
    step: '02',
    icon: <FaVideo />,
    title: 'Tư Vấn & Xem Video Call',
    description:
      'Chuyên viên và bác sĩ thú y tư vấn đặc tính, gửi thêm hình ảnh/video call tương tác trực tiếp với bé.'
  },
  {
    step: '03',
    icon: <FaFileContract />,
    title: 'Kiểm Tra Y Tế & Hợp Đồng',
    description:
      'Kiểm tra sức khỏe tổng quát, tẩy giun, tiêm chủng đầy đủ và ký hợp đồng bảo hành sức khỏe toàn diện.'
  },
  {
    step: '04',
    icon: <FaHome />,
    title: 'Đón Bé Về & Hỗ Trợ Trọn Đời',
    description:
      'Giao thú cưng tận nhà an toàn, tặng kèm bộ combo quà tặng đón bé và bác sĩ thú y đồng hành 24/7.'
  }
];

const ShoppingProcess = () => {
  return (
    <section className="py-5" id="shopping-process" style={{ backgroundColor: '#ffffff' }}>
      <Container>
        {/* Section Header */}
        <div className="text-center mb-5">
          <span className="section-badge">
            <FaPaw /> Đơn Giản & Minh Bạch
          </span>
          <h2 className="section-title">
            Quy Trình <span>Đón Thú Cưng</span> Về Nhà
          </h2>
          <p className="section-subtitle">
            Chỉ với 4 bước tiêu chuẩn y tế, bạn đã có thể đón một người bạn 4 chân khỏe mạnh,
            đáng yêu và an tâm tuyệt đối về chất lượng.
          </p>
        </div>

        {/* 4 Steps Row */}
        <Row className="g-4">
          {steps.map((item, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <div className="process-step-card">
                <div className="process-step-num">{item.step}</div>
                <div className="process-icon-box">{item.icon}</div>
                <h5 className="process-title">{item.title}</h5>
                <p className="process-desc">{item.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default ShoppingProcess;
