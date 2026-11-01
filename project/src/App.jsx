
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import Header from './components/common/Header';
import Footer from './components/common/Footer';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderManagementPage from './pages/OrderManagementPage';

import CategoryManagementPage from './pages/CategoryManagementPage';
import ProductManagementPage from './pages/ProductManagementPage';
import ProductDetailPage from './pages/ProductDetailPage';

import { CartProvider, useCart } from './context/CartContext';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { cartCount, addToCart } = useCart();

  const handleSearch = (query) => {
    setSearchQuery(query);

    // Chuyển sang trang tìm kiếm khi có từ khóa
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* Common Header */}
      <Header
        onSearch={handleSearch}
        cartCount={cartCount}
      />

      {/* Main Routes */}
      <main className="flex-grow-1">
        <Routes>

          {/* Home */}
          <Route
            path="/"
            element={
              <HomePage
                searchQuery={searchQuery}
                onAddToCart={addToCart}
              />
            }
          />

          {/* Search */}
          <Route
            path="/search"
            element={
              <SearchPage
                onAddToCart={addToCart}
              />
            }
          />

          {/* Product detail */}
          <Route
            path="/products/:id"
            element={
              <ProductDetailPage
                onAddToCart={addToCart}
              />
            }
          />

          {/* Product list: use Home page */}
          <Route
            path="/products"
            element={
              <HomePage
                searchQuery={searchQuery}
                onAddToCart={addToCart}
              />
            }
          />

          {/* Shopping Cart */}
          <Route
            path="/cart"
            element={<CartPage />}
          />

          {/* Checkout */}
          <Route
            path="/checkout"
            element={<CheckoutPage />}
          />

          {/* Customer Order History */}
          <Route
            path="/orders"
            element={<OrderHistoryPage />}
          />

          {/* Customer Order Detail */}
          <Route
            path="/orders/:id"
            element={<OrderDetailPage />}
          />

          {/* Admin Category Management */}
          <Route
            path="/admin/categories"
            element={<CategoryManagementPage />}
          />

          {/* Admin Product Management */}
          <Route
            path="/admin/categories/:categoryId/products"
            element={<ProductManagementPage />}
          />

          {/* Admin Order Management */}
          <Route
            path="/admin/orders"
            element={<OrderManagementPage />}
          />

          {/* Admin Order Detail */}
          <Route
            path="/admin/orders/:id"
            element={<OrderDetailPage />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <HomePage
                searchQuery={searchQuery}
                onAddToCart={addToCart}
              />
            }
          />

        </Routes>
      </main>

      {/* Common Footer */}
      <Footer />

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
