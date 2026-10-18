import React, { useState, useEffect, useRef } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import CategorySection from '../components/home/CategorySection';
import FeaturedPets from '../components/home/FeaturedPets';
import WhyChooseUs from '../components/home/WhyChooseUs';
import PopularBreeds from '../components/home/PopularBreeds';
import AccessoriesSection from '../components/home/AccessoriesSection';
import ShoppingProcess from '../components/home/ShoppingProcess';
import Testimonials from '../components/home/Testimonials';
import CTASection from '../components/home/CTASection';
import { FaCheckCircle } from 'react-icons/fa';

const HomePage = ({ searchQuery = '', onAddToCart }) => {
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const toastTimerRef = useRef(null);

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }

    setToastMessage(`Đã thêm "${product.name}" vào giỏ hàng!`);

    // Xóa timer cũ trước khi tạo timer mới
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return (
    <main className="homepage-wrapper">
      <HeroBanner />

      <CategorySection
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 3. Featured Pets */}
      <FeaturedPets searchQuery={searchQuery} onAddToCart={handleAddToCart} />
      <FeaturedPets
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />

      <WhyChooseUs />

      <PopularBreeds />

      <AccessoriesSection
        onAddToCart={handleAddToCart}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />

      <ShoppingProcess />

      <Testimonials />

      <CTASection />

      {toastMessage && (
        <div
          className="toast-notice"
          role="status"
          aria-live="polite"
        >
          <FaCheckCircle className="text-success fs-5" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
};

export default HomePage;