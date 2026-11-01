import { Container } from 'react-bootstrap';
import CheckoutSteps from './CheckoutSteps';

/** Banner đầu trang giỏ hàng / thanh toán, cùng phong cách với banner trang chủ. */
const ShopPageHeader = ({ icon, badge, title, highlight, subtitle, step }) => (
  <section className="shop-hero">
    <Container>
      <span className="section-badge">
        {icon} {badge}
      </span>
      <h1 className="section-title mt-2">
        {title} <span>{highlight}</span>
      </h1>
      {subtitle && <p className="shop-hero-sub">{subtitle}</p>}
      {step && <CheckoutSteps current={step} />}
    </Container> 
  </section>
);

export default ShopPageHeader;
