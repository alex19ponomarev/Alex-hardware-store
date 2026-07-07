import React, { useState, useEffect, useRef } from 'react';
import './Sales.css';
import vkIcon from '../../assets/icons/VK.com-logo.svg.png';
import telegramIcon from '../../assets/icons/Telegram_logo.svg.png';
import messengerMaxIcon from '../../assets/icons/max.webp';
const Sales = ({ cart, setCart }) => {
  const [salesProducts, setSalesProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [notification, setNotification] = useState('');
  const timeoutRef = useRef(null);
  const apiUrl = 'http://localhost/Sales.php';

  useEffect(() => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSalesProducts(data.data);
          setFilteredProducts(data.data);
        } else {
          console.error('Ошибка загрузки данных:', data.message);
        }
      })
      .catch(error => {
        console.error('Ошибка сети:', error);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(salesProducts);
    } else {
      const filtered = salesProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, salesProducts]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setNotification(''), 3000);
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    showNotification(`${product.name} добавлен в корзину!`);
  };

  return (
    <div className="sales">
      <div className="container">
        <h1 className="sales__title">Акции и скидки</h1>
        <p className="sales__subtitle">Специальные предложения — только ограниченное время!</p>
        <div className="search-panel">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск товаров по названию или категории..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              disabled={!searchTerm}
            >
              ×
            </button>
          </div>
          <span className="search-results">Найдено товаров: {filteredProducts.length}</span>
        </div>
        <div className="sales-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="sale-card">
              <div className="sale-card__image">
                <img src={product.imageUrl} alt={product.name} className="sale-card__img" />
                {product.discount && (
                  <span className="discount-badge">-{product.discount}%</span>
                )}
              </div>
              <div className="sale-card__info">
                <h3 className="sale-card__title">{product.name}</h3>
                <div className="sale-card__category">Категория: {product.category}</div>
                <div className="product-price">
                  {product.oldPrice && (
                    <span className="price-old">{product.oldPrice} ₽</span>
                  )}
                  <span className="price-current">{product.price} ₽</span>
                </div>
                <div className="sale-card__timer">
                  Акция действует до: {formatDate(product.saleEnds)}
                </div>
                <button
                  className="btn btn--add-to-cart"
                  onClick={() => addToCart(product)}
                >
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && searchTerm && (
          <div className="no-results">
            <p>По запросу «{searchTerm}» ничего не найдено</p>
          </div>
        )}
        {salesProducts.length === 0 && !searchTerm && (
          <div className="no-sales">
            <p>В данный момент акций нет. Следите за обновлениями!</p>
          </div>
        )}
      </div>
      {notification && (
        <div className="bottom-notification">
          {notification}
        </div>
      )}


      <footer className="footer">
        <div className="footer__container">
          <div className="footer__section">
            <h3 className="footer__title">О магазине</h3>
            <p>TechStore — ваш надёжный поставщик электроники и бытовой техники с 2026 года.</p>
          </div>

          <div className="footer__section">
            <h3 className="footer__title">Категории</h3>
            <ul className="footer__links">
              <li><a href="/catalog?category=Смартфоны">Смартфоны</a></li>
              <li><a href="/catalog?category=Ноутбуки">Ноутбуки</a></li>
              <li><a href="/catalog?category=Телевизоры">Телевизоры</a></li>
              <li><a href="/catalog?category=Аудиотехника">Аудиотехника</a></li>
            </ul>
          </div>

          <div className="footer__section">
            <h3 className="footer__title">Мы в соцсетях</h3>
            <div className="footer__social">
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

          <div className="footer__section" id="contacts-section">
            <h3 className="footer__title">Контакты</h3>
            <div className="footer__contacts">
              <p>📞 +88005553535</p>
              <p>✉️ Alex@techstore.ru</p>
              <p>📍 г. Ростов-на-Дону, ул. Проспект Ленина</p>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; 2026 TechStore. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Sales;