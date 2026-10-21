
import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderManagementPage from './pages/OrderManagementPage';

const CART_STORAGE_KEY = 'pet-shop-cart';

function AppContent() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

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
      <Header cartCount={cartCount} />

      <div className="flex-grow-1">
        <Routes>
          {/* Trang chủ */}
          <Route
            path="/"
            element={
              <HomePage
                onAddToCart={handleAddToCart}
              />
            }
          />

          {/* Trang sản phẩm */}
          <Route
            path="/products"
            element={
              <HomePage
                onAddToCart={handleAddToCart}
              />
            }
          />

          {/* Trang kết quả tìm kiếm: /search?q=từ-khóa */}
          <Route
            path="/search"
            element={<SearchPage onAddToCart={handleAddToCart} />}
          />

          {/* Trang giỏ hàng */}
          <Route
            path="/cart"
            element={
              <CartPage
                cartItems={cartItems}
                onUpdateQuantity={updateCartQuantity}
                onRemove={removeFromCart}
              />
            }
          />

          {/* Trang thanh toán */}
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                onClearCart={clearCart}
              />
            }
          />

          {/* Quản lý đơn hàng */}
          <Route
            path="/admin/orders"
            element={<OrderManagementPage />}
          />

          {/* Các đường dẫn không xác định */}
          <Route
            path="*"
            element={
              <HomePage
                onAddToCart={handleAddToCart}
              />
            }
          />
        </Routes>
      </div>

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
