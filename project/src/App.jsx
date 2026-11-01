import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import OrderManagementPage from './pages/OrderManagementPage';
import OrderDetailPage from './pages/OrderDetailPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderManagementPage from './pages/OrderManagementPage';
import { CartProvider, useCart } from './context/CartContext';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, addToCart } = useCart();

  const home = (
    <HomePage
      searchQuery={searchQuery}
      onAddToCart={addToCart}
    />
import CategoryManagementPage from './pages/CategoryManagementPage';
import ProductManagementPage from './pages/ProductManagementPage';

const CART_STORAGE_KEY = 'pet-shop-cart';

function AppContent() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // Lưu từ khóa tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');

  // Xử lý khi người dùng tìm kiếm
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

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header onSearch={setSearchQuery} cartCount={cartCount} />

      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={home} />
          <Route path="/products" element={home} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/admin/orders" element={<OrderManagementPage />} />
          <Route path="*" element={home} />
        </Routes>
    <BrowserRouter>
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
              path="/admin/categories"
              element={<CategoryManagementPage />}
            />

            <Route
              path="/admin/categories/:categoryId/products"
              element={<ProductManagementPage />}
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

    </BrowserRouter>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
    <AppContent />
  );
}

export default App;
