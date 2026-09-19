import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Sales.css';
import Footer from '../Footer/Footer';
import { useFavorites } from '../useFavorites/useFavorites';

const Sales = ({ cart, setCart }) => {
  const [salesProducts, setSalesProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [notification, setNotification] = useState('');
  const timeoutRef = useRef(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetch('/Sales.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSalesProducts(data.data);
          setFilteredProducts(data.data);
        } else {
          console.error('Ошибка загрузки данных:', data.message);
        }
      })
      .catch((error) => {
        console.error('Ошибка сети:', error);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(salesProducts);
    } else {
      const filtered = salesProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, salesProducts]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const showNotification = (msg) => {
    setNotification(msg);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setNotification(''), 3000);
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    showNotification(`${product.name} добавлен в корзину!`);
  };


  const getStatus = (product) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!product.saleEnds) {
      return { isActive: true, daysLeft: null, text: 'Акция действует', icon: '⏰', urgent: false };
    }

    const end = new Date(product.saleEnds);
    end.setHours(0, 0, 0, 0);
    const diffMs = end - today;
    const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { isActive: false, daysLeft: null, text: 'Акция завершена', icon: '❌', urgent: false };
    }
    if (daysLeft === 0) {
      return { isActive: true, daysLeft: 0, text: 'Последний день акции!', icon: '⏳', urgent: true };
    }
    if (daysLeft === 1) {
      return { isActive: true, daysLeft: 1, text: 'Остался 1 день', icon: '⏳', urgent: true };
    }
    if (daysLeft <= 3) {
      return { isActive: true, daysLeft, text: `Осталось ${daysLeft} дня`, icon: '⏳', urgent: true };
    }
    return {
      isActive: true,
      daysLeft,
      text: `Акция действует до: ${formatDate(product.saleEnds)}`,
      icon: '⏰',
      urgent: false,
    };
  };

  return (
    <div className="sales-page-wrap">
      <div className="sales">
        <div className="sales-container">
          <h1 className="sales-title">Акции и скидки</h1>
          <p className="sales-subtitle">Специальные предложения — только ограниченное время!</p>

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
            {filteredProducts.map((product) => {
              const status = getStatus(product);
              const { isActive, text, icon, urgent } = status;

              return (
                <div
                  key={product.id}
                  className={`sale-card ${!isActive ? 'sale-card--expired' : ''} ${
                    urgent ? 'sale-card--urgent' : ''
                  }`}
                >
                  <div className="sale-card-image">
                    <button
                      type="button"
                      className={`favorite-btn ${isFavorite(product.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      aria-label={isFavorite(product.id) ? 'Убрать из избранного' : 'В избранное'}
                    >
                      {isFavorite(product.id) ? '❤️' : '🤍'}
                    </button>

                    <img src={product.imageUrl} alt={product.name} className="sale-card-img" />

                    {isActive && product.discount ? (
                      <span className="discount-badge">-{product.discount}%</span>
                    ) : null}

                    {!isActive && (
                      <span className="expired-badge">Завершено</span>
                    )}
                  </div>

                  <div className="sale-card-info">
                    <h3 className="sale-card-title">{product.name}</h3>
                    <div className="sale-card-category">Категория: {product.category}</div>

                    <div className="product-price">
                      {isActive && product.oldPrice ? (
                        <span className="price-old">{product.oldPrice} ₽</span>
                      ) : null}
                      <span className={`price-current ${!isActive ? 'price-current--expired' : ''}`}>
                        {product.price} ₽
                      </span>
                    </div>

                    <div
                      className={`sale-card-timer ${
                        !isActive
                          ? 'sale-card-timer--expired'
                          : urgent
                          ? 'sale-card-timer--urgent'
                          : ''
                      }`}
                    >
                      <span className="sale-card-timer-icon">{icon}</span>
                      <span>{text}</span>
                    </div>

                    <button
                      className="btn btn--add-to-cart"
                      onClick={() => addToCart(product)}
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              );
            })}
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
          <div className="bottom-notification">{notification}</div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Sales;