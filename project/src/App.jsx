import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

  // Save cart to localStorage
  // Lưu từ khóa tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');

  // Xử lý khi người dùng tìm kiếm
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Lưu giỏ hàng vào localStorage khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  // Calculate cart count
  const cartCount = useMemo(
    () => cartItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    ),
    [cartItems]
  );


  // Add product to cart
  const handleAddToCart = (product) => {
    setCartItems((current) => {
      const existing = current.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existing) {
        // Pets cannot have quantity greater than 1
        if (
          product.petType === 'dog' ||
          product.petType === 'cat'
        ) {
          return current;
        }

        return current.map((item) =>
          String(item.id) === String(product.id)
            ? {
              ...item,
              quantity: item.quantity + 1
            }
            : item
        );
      }

      return [
        ...current,
        { ...product, quantity: 1 }
      ];
    });
  };

  // Update cart quantity
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

  // Remove product from cart
  const removeFromCart = (id) => {
    setCartItems((current) =>
      current.filter(
        (item) => String(item.id) !== String(id)
      )
    );
  };

  // Clear cart after checkout
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* Common Header */}
      <Header cartCount={cartCount} />

      {/* Main Routes */}
      <main className="flex-grow-1">
        <Routes>

          {/* Home */}
          <Route
            path="/"
            element={
              <HomePage
                onAddToCart={handleAddToCart}
              />
            }
          />

          {/* Search */}
          <Route
            path="/search"
            element={
              <SearchPage
                onAddToCart={handleAddToCart}
              />
            }
          />

          {/* Shopping Cart */}
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

          {/* Checkout */}
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                onClearCart={clearCart}
              />
            }
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
                onAddToCart={handleAddToCart}
              />
            }
          />

        </Routes>
      </main>

      {/* Common Footer */}
      <Footer />

    </div>

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
