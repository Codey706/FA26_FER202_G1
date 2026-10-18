import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(3);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Header
          onSearch={handleSearch}
          cartCount={cartCount}
        />

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

            {/* /products cũng hiển thị HomePage */}
            <Route
              path="/products"
              element={
                <HomePage
                  searchQuery={searchQuery}
                  onAddToCart={handleAddToCart}
                />
              }
            />

            {/* Các đường dẫn không xác định */}
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

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
