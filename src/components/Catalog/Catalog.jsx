import React, { useState, useEffect } from 'react';
import './Catalog.css';
import { useSearchParams } from 'react-router-dom';

const Catalog = ({ cart, setCart }) => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'Все категории';

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories] = useState([
    'Все категории',
    'Смартфоны',
    'Ноутбуки',
    'Телевизоры',
    'Аудиотехника',
    'Планшеты',
    'Умные часы'
  ]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost/Catalog.php');
        if (!response.ok) throw new Error('Ошибка сети или сервер недоступен');
        const data = await response.json();

        if (data.success) {
          setProducts(data.data);
          setFilteredProducts(data.data);
        } else {
          setError(data.message || 'Не удалось загрузить товары');
        }
      } catch (err) {
        setError('Не удалось загрузить товары: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const addToCart = (product) => {
    if (!setCart) {
      console.error('setCart не передан в компонент Catalog');
      return;
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    addMessage(`${product.name} добавлен в корзину!`);
  };


  useEffect(() => {
    let result = [...products];

    if (selectedCategory !== 'Все категории') {
      result = result.filter((product) => product.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [selectedCategory, sortBy, searchTerm, products]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="catalog">
      {loading && <div className="loading">Загрузка товаров...</div>}
      {error && <div className="error">{error}</div>}
      <div className="container">
        <h1 className="catalog__title">Каталог товаров</h1>
        {message && <div className="notification">{message}</div>}
        <div className="catalog-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <div className="category-filter">
              <h3>Категории:</h3>
              <div className="category-buttons">
                {
                  categories.map((category) => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="sort-filter">
              <label htmlFor="sort">Сортировка:</label>
              <select id="sort" value={sortBy} onChange={handleSortChange} className="sort-select">
                <option value="popular">По популярности</option>
                <option value="price-asc">Цена: по возрастанию</option>
                <option value="price-desc">Цена: по убыванию</option>
                <option value="rating">По рейтингу</option>
              </select>
            </div>
          </div>
        </div>
        <div className="products-grid">
        {
          filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
          <div className="product-card__image">
        {
          product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
            onError={(e) => {
            
              e.onerror = null;
          }}
          />
        ) : (
          <div className="no-image">Нет изображения</div>
        )}
        {
        product.discount && (
          <span className="discount-badge">-{product.discount}%</span>
        )}
      </div>
      <div className="product-card__info">
        <h3 className="product-card__title">{product.name}</h3>
        <div className="product-rating">
          <span className="rating-stars">
            {'★'.repeat(Math.floor(Number(product.rating) || 0))}
          </span>
          <span className="rating-value">
            {Number(product.rating).toFixed(1) || '—'}
          </span>
          <span className="rating-reviews">({product.reviews || 0})</span>
        </div>
        <div className="product-price">
          {product.oldPrice && <span className="price-old">{product.oldPrice} ₽</span>}
          <span className="price-current">{product.price} ₽</span>
        </div>
        <button
          className="btn btn--add-to-cart"
          onClick={() => addToCart(product)}
        >
          В корзину
        </button>
      </div>
    </div>
  ))
):(
      <p>Товары не найдены</p>
)}
    </div>
    </div>
  </div>
  );
};

export default Catalog;