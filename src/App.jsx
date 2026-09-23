import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Catalog from './components/Catalog/Catalog';
import Sales from './components/Sales/Sales';
import Cart from './components/Cart/Cart';
import Header from './components/Header/Header';
import RegisterPage from './components/RegisterPage/RegisterPage';
import LoginPage from './components/LoginPage/LoginPage';
import ProfilePage from './components/ProfilePage/ProfilePage';
import ProductPage from './components/ProductPage/ProductPage';
import Admin from './components/Admin/Admin';
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy';
import CookieBanner from './components/CookieBanner/CookieBanner';

function App() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <HashRouter>
      <Header cart={cart} user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Home cart={cart} setCart={setCart} />} />
        <Route path="/catalog" element={<Catalog cart={cart} setCart={setCart} />} />
        <Route path="/sales" element={<Sales cart={cart} setCart={setCart} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route
          path="/profile"
          element={
            <ProfilePage
              user={user}
              onLogout={handleLogout}
              onUpdateUser={setUser}
            />
          }
        />

        <Route path="/product/:id" element={<ProductPage cart={cart} setCart={setCart} />} />

        <Route path="/admin" element={<Admin />} />
      </Routes>

      <CookieBanner />
    </HashRouter>
  );
}

export default App;