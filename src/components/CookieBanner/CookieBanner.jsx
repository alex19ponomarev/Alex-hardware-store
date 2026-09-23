import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieBanner.css';

const COOKIE_KEY = 'cookieConsentAccepted';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(COOKIE_KEY);
      if (!accepted) {

        const timer = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_KEY, 'true');
    } catch {

    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Уведомление об использовании cookie">
      <div className="cookie-banner-content">
        <div className="cookie-banner-icon">🍪</div>
        <div className="cookie-banner-text">
          <p>
            Мы используем файлы cookie для сохранения данных авторизации,
            содержимого корзины и улучшения работы сайта. Продолжая использовать
            сайт, вы соглашаетесь с{' '}
            <Link to="/privacy">политикой конфиденциальности</Link>.
          </p>
        </div>
        <button className="cookie-banner-btn" onClick={handleAccept}>
          Принять
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;