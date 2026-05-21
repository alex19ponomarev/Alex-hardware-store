import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home/Home';
import Catalog from './components/Catalog/Catalog';
import Sales from './components/Sales/Sales';
import Cart from './components/Cart/Cart';
import Header from './components/Header/Header';

import RegisterPage from './components/RegisterPage/RegisterPage';
import LoginPage from './components/LoginPage/LoginPage';

function App() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  return (
    <BrowserRouter>
      <Header cart={cart} />
      
      <Routes>
        <Route path="/" element={<Home cart={cart} setCart={setCart} />} />
        <Route path="/catalog" element={<Catalog cart={cart} setCart={setCart} />} />
        <Route path="/sales" element={<Sales cart={cart} setCart={setCart} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;