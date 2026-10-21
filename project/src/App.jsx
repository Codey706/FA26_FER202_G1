
import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import OrderManagementPage from './pages/OrderManagementPage';
import OrderDetailPage from './pages/OrderDetailPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';

const CART_STORAGE_KEY = 'pet-shop-cart';

function AppContent() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  // Lưu giỏ hàng vào localStorage khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = (product) => {
    setCartItems((current) => {
      const existing = current.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existing) {
        // Thú cưng là sản phẩm độc nhất, không tăng số lượng vượt quá 1.
        if (product.petType === 'dog' || product.petType === 'cat') {
          return current;
        }

        return current.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartQuantity = (id, quantity) => {
    setCartItems((current) =>
      current
        .map((item) =>
          String(item.id) === String(id)
            ? { ...item, quantity }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Xóa một sản phẩm khỏi giỏ hàng
  const removeFromCart = (id) => {
    setCartItems((current) =>
      current.filter((item) => String(item.id) !== String(id))
    );
  };

  // Xóa toàn bộ giỏ hàng sau khi checkout
  const clearCart = () => setCartItems([]);

  return (
      <div className="d-flex flex-column min-vh-100">
        {/* Common Header */}
        <Header onSearch={handleSearch} cartCount={cartCount} />

        {/* Main Routes */}
        <div className="flex-grow-1">

          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  searchQuery={searchQuery}
                  onAddToCart={handleAddToCart}
                />
              }
            />

            <Route
              path="/admin/orders"
              element={<OrderManagementPage />}
            />

            <Route
              path="/admin/orders/:id"
              element={<OrderDetailPage />}
            />

            {/* Fallback route must be last */}
            <Route
              path="*"
              element={
                <HomePage
                  searchQuery={searchQuery}
                  onAddToCart={handleAddToCart}
                />
              }
            />
          </Routes>

        </div>

        {/* Common Footer */}
        <Footer />
      </div>
      );
}

      function App() {
  return (
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      );
}

      export default App;
