import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
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
      </div>

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
