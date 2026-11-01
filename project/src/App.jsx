import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';

import Header from './components/common/Header';
import Footer from './components/common/Footer';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

import OrderManagementPage from './pages/OrderManagementPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';

import CategoryManagementPage from './pages/CategoryManagementPage';
import ProductManagementPage from './pages/ProductManagementPage';

import RequireAuth from './components/auth/RequireAuth';
import { AuthProvider } from './context/AuthContext';

const CART_STORAGE_KEY = 'pet-shop-cart';

function AppContent() {
    // Search
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    // Cart: Load data from localStorage
    const [cartItems, setCartItems] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem(CART_STORAGE_KEY) || '[]'
            );
        } catch {
            return [];
        }
    });

    // Save cart whenever cartItems changes
    useEffect(() => {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cartItems)
        );
    }, [cartItems]);

    // Calculate cart count
    const cartCount = useMemo(() => {
        return cartItems.reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0
        );
    }, [cartItems]);

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
            <Header
                onSearch={handleSearch}
                cartCount={cartCount}
            />

            <main className="flex-grow-1">
                <Routes>
                    {/* Home */}
                    <Route
                        path="/"
                        element={
                            <HomePage
                                searchQuery={searchQuery}
                                onAddToCart={handleAddToCart}
                            />
                        }
                    />

                    {/* Search */}
                    <Route
                        path="/search"
                        element={
                            <SearchPage
                                searchQuery={searchQuery}
                                onAddToCart={handleAddToCart}
                            />
                        }
                    />

                    {/* Products */}
                    <Route
                        path="/products"
                        element={
                            <HomePage
                                searchQuery={searchQuery}
                                onAddToCart={handleAddToCart}
                            />
                        }
                    />

                    {/* Cart */}
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

                    {/* Login */}
                    <Route
                        path="/login"
                        element={<LoginPage />}
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

                    {/* Fallback */}
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
            </main>

            <Footer />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
