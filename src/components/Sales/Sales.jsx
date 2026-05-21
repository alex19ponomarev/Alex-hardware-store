import React, { useState, useEffect, useRef } from 'react';
import './Sales.css';
import productImage1 from '../../assets/images/831a385f76f265293448bc5b858ab3d74053e6cf4ada47e0649b959d7bcb5567.jpg.webp';
import productImage2 from '../../assets/images/f8c1d514292bd887b7279a1fa5f26692c8c70e6dd1ca86b6a8a7b3a4f4b6b0bd.jpg.webp';
import productImage3 from '../../assets/images/7dde57929a7052a80ee0cb23bea558c3e2fefe222cb4e3c3b38015d9e9585f6f.jpg.webp';
import productImage4 from '../../assets/images/4c50e9737ae8188a63bd98b1bfeb429bef560e3599fea1c03b45e8d06bb400cb.jpg.webp';
const Sales = ({ cart, setCart }) => {
  const [salesProducts, setSalesProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [notification, setNotification] = useState('');
  const timeoutRef = useRef(null);
  useEffect(() => {
    const mockSales = [
          {
            id: 1,
            name: '6.7" Смартфон Samsung Galaxy A56 256 ГБ черный',
            price: 32999 ,
            oldPrice: 60999,
            discount: 14,
            category: 'Смартфоны',
            rating: 4.8,
            reviews: 124,
            image: productImage1,
        saleEnds: '2026-11-25'
          },
      {
       id: 2,
              name: '16" Ноутбук HUAWEI MateBook D 16 2024 MCLF-X серый',
              price: 54999,
              oldPrice: null,
              discount: null,
              category: 'Ноутбуки',
              rating: 4.9,
              reviews: 89,
              image: productImage2,
              saleEnds: '2026-12-25'
      },
      {
    id: 3,
            name: 'Беспроводные/проводные наушники Marshall Major V черный 2024',
            price: 8199,
            oldPrice: 9499,
            discount: 23,
            category: 'Аудиотехника',
            rating: 4.7,
            reviews: 201,
            image: productImage3,
        saleEnds: '2026-11-30'
      },
      {
        id: 4,
                name: '11.5" Планшет HUAWEI MatePad 11.5 (2025) Wi-Fi 256 ГБ фиолетовый + клавиатура + чехол',
                price: 30999,
                oldPrice: 24999,
                discount: 20,
                category: 'Планшеты',
                rating: 4.6,
                reviews: 76,
                image: productImage4,
        saleEnds: '2026-12-15'
      }
    ];
    setSalesProducts(mockSales);
    setFilteredProducts(mockSales);
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
  <img src={product.image} alt={product.name} className="sale-card__img" />
  <span className="discount-badge">-{product.discount}%</span>
</div>
              <div className="sale-card__info">
                <h3 className="sale-card__title">{product.name}</h3>
                <div className="sale-card__category">Категория: {product.category}</div>
                <div className="product-price">
                  <span className="price-old">{product.oldPrice} ₽</span>
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
    </div>
  );
};

export default Sales;