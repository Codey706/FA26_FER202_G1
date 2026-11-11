import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import Header from './components/common/Header';
import Footer from './components/common/Footer';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ProfilePage from './pages/ProfilePage';

import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderManagementPage from './pages/OrderManagementPage';

import CategoryManagementPage from './pages/CategoryManagementPage';
import ProductManagementPage from './pages/ProductManagementPage';
import ProductDetailPage from './pages/ProductDetailPage';
import UserManagementPage from './pages/UserManagementPage';

import RequireAuth from './components/auth/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { cartCount, addToCart } = useCart();

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
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

          {/* Product Detail */}
          <Route
            path="/products/:id"
            element={
              <ProductDetailPage
                onAddToCart={addToCart}
              />
            }
          />

          {/* Products List (Home page) */}
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

          {/* Checkout (bắt buộc đăng nhập) */}
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
          />

          {/* Login */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* Register (Đăng ký thành viên) */}
          <Route
            path="/register"
            element={<RegisterPage />}
          />

          {/* Forgot Password (Quên mật khẩu) */}
          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />

          {/* Change Password (Đổi mật khẩu) */}
          <Route
            path="/change-password"
            element={
              <RequireAuth>
                <ChangePasswordPage />
              </RequireAuth>
            }
          />

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />

          {/* Customer Order History */}
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <OrderHistoryPage />
              </RequireAuth>
            }
          />

          {/* Customer Order Detail */}
          <Route
            path="/orders/:id"
            element={
              <RequireAuth>
                <OrderDetailPage />
              </RequireAuth>
            }
          />

          {/* Admin Category Management */}
          <Route
            path="/admin/categories"
            element={
              <RequireAuth roles={['admin', 'staff']}>
                <CategoryManagementPage />
              </RequireAuth>
            }
          />

          {/* Admin Product Management */}
          <Route
            path="/admin/categories/:categoryId/products"
            element={
              <RequireAuth roles={['admin', 'staff']}>
                <ProductManagementPage />
              </RequireAuth>
            }
          />

          {/* Admin Order Management */}
          <Route
            path="/admin/orders"
            element={
              <RequireAuth roles={['admin', 'staff']}>
                <OrderManagementPage />
              </RequireAuth>
            }
          />

          {/* Admin Order Detail */}
          <Route
            path="/admin/orders/:id"
            element={
              <RequireAuth roles={['admin', 'staff']}>
                <OrderDetailPage />
              </RequireAuth>
            }
          />

          {/* Admin User Management (Quản trị người dùng) */}
          <Route
            path="/admin/users"
            element={
              <RequireAuth roles={['admin']}>
                <UserManagementPage />
              </RequireAuth>
            }
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

      {/* Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
