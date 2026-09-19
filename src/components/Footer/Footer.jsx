import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import vkIcon from '../../assets/icons/VK.com-logo.svg.png';
import telegramIcon from '../../assets/icons/Telegram_logo.svg.png';
import messengerMaxIcon from '../../assets/icons/max.webp';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">О магазине</h3>
          <p>TechStore — ваш надёжный поставщик электроники и бытовой техники с 2026 года.</p>
          <ul className="footer-links" style={{ marginTop: '14px' }}>
            <li>
              <Link to="/privacy">Политика конфиденциальности</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Категории</h3>
          <ul className="footer-links">
            <li><Link to="/catalog?category=Смартфоны">Смартфоны</Link></li>
            <li><Link to="/catalog?category=Ноутбуки">Ноутбуки</Link></li>
            <li><Link to="/catalog?category=Телевизоры">Телевизоры</Link></li>
            <li><Link to="/catalog?category=Аудиотехника">Аудиотехника</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Мы в соцсетях</h3>
          <div className="footer-social">
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Telegram"
            >
              <img src={telegramIcon} alt="Telegram" className="social-icon-img" />
            </a>
            <a
              href="https://vk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="VKontakte"
            >
              <img src={vkIcon} alt="ВКонтакте" className="social-icon-img" />
            </a>
            <a
              href="https://max.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Messenger Max"
            >
              <img src={messengerMaxIcon} alt="Messenger Max" className="social-icon-img" />
            </a>
          </div>
        </div>

        <div className="footer-section" id="contacts-section">
          <h3 className="footer-title">Контакты</h3>
          <div className="footer-contacts">
            <p>📞 +88005553535</p>
            <p>✉️ Alex@techstore.ru</p>
            <p>📍 г. Ростов-на-Дону, ул. Проспект Ленина</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          <Link
            to="/privacy"
            style={{ color: '#bdc3c7', marginRight: '16px', textDecoration: 'none' }}
          >
            Политика конфиденциальности
          </Link>
          &copy; 2026 TechStore. Все права защищены.
        </p>
      </div>
    </footer>
  );
};

export default Footer;