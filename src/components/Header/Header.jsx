import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ cart = [], user = null, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  const handleContactsClick = (e) => {
    e.preventDefault();
    closeMenu();
    const contactsSection = document.getElementById('contacts-section');
    if (contactsSection) {
      contactsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo logo-animated">
          <Link to="/">
          <h1>AlexTechStore</h1>
          </Link>
        </div>


        <button 
          className={`header__mobile-menu ${isMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isMenuOpen}
        >
          {!isMenuOpen && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
          {isMenuOpen && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )}
        </button>

        <nav className={`header__nav ${isMenuOpen ? 'active' : ''}`} id="navigation" ref={menuRef}>
          <ul className="header__menu">
            <li><Link to="/" onClick={closeMenu}>Главная</Link></li>
            <li><Link to="/catalog" onClick={closeMenu}>Каталог</Link></li>
            <li><Link to="/sales" onClick={closeMenu}>Акции</Link></li>
            <li>
              <a href="#contacts-section" onClick={handleContactsClick}>Контакты</a>
            </li>
          </ul>
        </nav>

        <div className="header__actions">
          <div className="header__cart">
            <Link to="/cart" className="header__cart-btn" onClick={closeMenu}>
              🛒 Корзина ({totalItems})
            </Link>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </div>

          <div className="header__auth">
            {user ? (
              <>
                <span className="header__profile-info"> {user.email}</span>
                <button onClick={onLogout} className="logout-btn">Выйти</button>
              </>
            ) : (
              <>
                <Link to="/login" className="header__auth-btn" onClick={closeMenu}>Войти</Link>
                <Link to="/register" className="header__register-btn" onClick={closeMenu}>Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;