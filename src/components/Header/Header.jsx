import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ cart = [], user = null, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const loadAvatar = () => {
    if (!user?.email) {
      setAvatar('');
      return;
    }
    try {
      const profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
      setAvatar(profiles[user.email]?.avatar || '');
    } catch {
      setAvatar('');
    }
  };

  useEffect(() => {
    loadAvatar();
  }, [user]);


  useEffect(() => {
    if (!user?.email) {
      setIsAdmin(false);
      return;
    }
    fetch(`/admin_api.php?action=check&email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin === true))
      .catch(() => setIsAdmin(false));
  }, [user]);

  useEffect(() => {
    const handleUpdate = () => loadAvatar();
    window.addEventListener('userProfileUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('userProfileUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  const handleContactsClick = (e) => {
    e.preventDefault();
    closeMenu();
    const contactsSection = document.getElementById('contacts-section');
    if (contactsSection) {
      contactsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToProfile = () => {
    navigate('/profile');
    closeMenu();
  };

  const handleLogoutClick = () => {
    onLogout();
    setAvatar('');
    setIsAdmin(false);
    closeMenu();
  };

  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '👤';

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <h1>AlexTechStore</h1>
          </Link>
        </div>

        <nav className="header-nav">
          <ul className="header-menu">
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/catalog">Каталог</Link></li>
            <li><Link to="/sales">Акции</Link></li>
            <li>
              <a href="#contacts-section" onClick={handleContactsClick}>Контакты</a>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin" className="header-admin-link">⚙️ Админка</Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="header-actions">
          <div className="header-cart">
            <Link to="/cart" className="header-cart-btn">
              🛒 Корзина ({totalItems})
            </Link>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </div>

          <div className="header-auth">
            {user ? (
              <div className="user-dropdown">
                <button
                  onClick={goToProfile}
                  className="header-profile-btn"
                  title={`Профиль: ${user.email}`}
                >
                  <span className="user-avatar-small">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Аватар"
                        className="user-avatar-small-img"
                      />
                    ) : (
                      initial
                    )}
                  </span>
                  <span className="user-name">{user.name || user.email}</span>
                </button>
                <button onClick={handleLogoutClick} className="logout-btn">
                  Выйти
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="header-auth-btn">Войти</Link>
                <Link to="/register" className="header-register-btn">Регистрация</Link>
              </>
            )}
          </div>
        </div>

        <button
          className={`header-burger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div
        className={`header-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      />

      <aside className={`header-drawer ${isMenuOpen ? 'active' : ''}`}>
        <div className="header-drawer-head">
          <span className="header-drawer-title">Меню</span>
          <button
            className="header-drawer-close"
            onClick={closeMenu}
            aria-label="Закрыть меню"
          >
            ×
          </button>
        </div>

        <nav className="header-drawer-nav">
          <Link to="/" onClick={closeMenu}>Главная</Link>
          <Link to="/catalog" onClick={closeMenu}>Каталог</Link>
          <Link to="/sales" onClick={closeMenu}>Акции</Link>
          <a href="#contacts-section" onClick={handleContactsClick}>Контакты</a>
          {isAdmin && (
            <Link to="/admin" onClick={closeMenu}>⚙️ Админка</Link>
          )}
        </nav>

        <div className="header-drawer-actions">
          <Link to="/cart" className="header-drawer-btn header-drawer-btn-cart" onClick={closeMenu}>
            🛒 Корзина ({totalItems})
          </Link>

          {user ? (
            <>
              <button onClick={goToProfile} className="header-drawer-btn header-drawer-btn-profile">
                <span className="header-drawer-avatar">
                  {avatar ? (
                    <img src={avatar} alt="Аватар" className="header-drawer-avatar-img" />
                  ) : (
                    initial
                  )}
                </span>
                <span className="header-drawer-name">{user.name || user.email}</span>
              </button>
              <button onClick={handleLogoutClick} className="header-drawer-btn header-drawer-btn-logout">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-drawer-btn header-drawer-btn-login" onClick={closeMenu}>
                Войти
              </Link>
              <Link to="/register" className="header-drawer-btn header-drawer-btn-register" onClick={closeMenu}>
                Регистрация
              </Link>
            </>
          )}
        </div>
      </aside>
    </header>
  );
};

export default Header;