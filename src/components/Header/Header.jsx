import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
const Header = ({ cart = [] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleContactsClick = (e) => {
    e.preventDefault();
    const contactsSection = document.getElementById('contacts-section');
    if (contactsSection) {
      contactsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="header" role="banner">
      <div className="header__container">
        <div className="header__logo">
          <h1>AlexTechStore</h1>
          <span className="logo-tagline">Техника для жизни</span>
        </div>
        <button
          className={`header__mobile-menu ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Открыть меню"
          aria-expanded={isMenuOpen}
          aria-controls="navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav
          className={`header__nav ${isMenuOpen ? 'active' : ''}`}
          id="navigation"
          ref={menuRef}
        >
          <ul className="header__menu">
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/catalog">Каталог</Link></li>
            <li><Link to="/sales">Акции</Link></li>
            <li>
              <a href="#contacts-section" onClick={handleContactsClick}>
                Контакты
              </a>
            </li>
          </ul>
        </nav>
        <div className="header__actions">
          <div className="header__cart">
            <Link to="/cart" className="header__cart-btn">
              🛒 Корзина ({totalItems})
            </Link>
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </div>

          <button
            className="header__auth-btn"
            onClick={() => navigate('/login')}
          >
            Войти
          </button>
          
          <button
            className="header__register-btn"
            onClick={() => navigate('/register')}
          >
            Регистрация
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;