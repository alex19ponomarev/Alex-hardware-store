import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
const RequireAuth = ({ user, children }) => {
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname, message: 'Войдите в аккаунт, чтобы продолжить' }}
        replace
      />
    );
  }
  return children;
};

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
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/product/:id" element={<ProductPage cart={cart} setCart={setCart} />} />

        <Route
          path="/cart"
          element={
            <RequireAuth user={user}>
              <Cart cart={cart} setCart={setCart} />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth user={user}>
              <ProfilePage
                user={user}
                onLogout={handleLogout}
                onUpdateUser={setUser}
              />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={<Admin user={user} key={user?.email || 'guest'} />}
        />
      </Routes>

      <CookieBanner />
    </HashRouter>
  );
}

export default App;