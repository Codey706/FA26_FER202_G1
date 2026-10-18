import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

const CART_STORAGE_KEY = 'pet-shop-cart';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const handleAddToCart = (product) => {
    setCartItems((current) => {
      const existing = current.find((item) => String(item.id) === String(product.id));
      if (existing) {
        // Thú cưng là sản phẩm độc nhất, không tăng số lượng vượt quá 1.
        if (product.petType === 'dog' || product.petType === 'cat') return current;
        return current.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id, quantity) => {
    setCartItems((current) =>
      current
        .map((item) => String(item.id) === String(id) ? { ...item, quantity } : item)
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems((current) => current.filter((item) => String(item.id) !== String(id)));
  };

  const clearCart = () => setCartItems([]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header
        onSearch={setSearchQuery}
        cartCount={cartCount}
      />
      <div className="flex-grow-1">
        <Routes>
          <Route
            path="/"
            element={<HomePage searchQuery={searchQuery} onAddToCart={handleAddToCart} />}
          />
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
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                onClearCart={clearCart}
              />
            }
          />
          <Route
            path="*"
            element={<HomePage searchQuery={searchQuery} onAddToCart={handleAddToCart} />}
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
