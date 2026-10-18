import React, { useState } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import CategorySection from '../components/home/CategorySection';
import FeaturedPets from '../components/home/FeaturedPets';
import WhyChooseUs from '../components/home/WhyChooseUs';
import PopularBreeds from '../components/home/PopularBreeds';
import AccessoriesSection from '../components/home/AccessoriesSection';
import ShoppingProcess from '../components/home/ShoppingProcess';
import Testimonials from '../components/home/Testimonials';
import CTASection from '../components/home/CTASection';
import { FaCheckCircle, FaShoppingCart } from 'react-icons/fa';

const HomePage = ({ searchQuery, onAddToCart }) => {
  const [toastMessage, setToastMessage] = useState(null);

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
    setToastMessage(`Đã thêm "${product.name}" vào giỏ hàng!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <main className="homepage-wrapper">
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Shop By Category */}
      <CategorySection />

      {/* 3. Featured Pets */}
      <FeaturedPets searchQuery={searchQuery} />

      {/* 4. Why Choose Us */}
      <WhyChooseUs />

      {/* 5. Popular Breeds */}
      <PopularBreeds />

      {/* 6. Pet Accessories */}
      <AccessoriesSection onAddToCart={handleAddToCart} />

      {/* 7. Shopping Process */}
      <ShoppingProcess />

      {/* 8. Customer Reviews */}
      <Testimonials />

      {/* 9. Call To Action */}
      <CTASection />

      {/* Toast Notification when adding to cart */}
      {toastMessage && (
        <div className="toast-notice">
          <FaCheckCircle className="text-success fs-5" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
};

export default HomePage;
