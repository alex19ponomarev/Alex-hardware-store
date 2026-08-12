import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductPage.css';

const ProductPage = ({ cart, setCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost/Product.php?id=${id}`);
        if (!response.ok) throw new Error('Товар не найден или ошибка сервера');
        const data = await response.json();

        if (data.success && data.data) {
          setProduct(data.data);
        } else {
          throw new Error(data.message || 'Товар не найден');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const addToCart = (item) => {
    if (!setCart) {
      console.error('setCart не передан в компонент ProductPage');
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    addMessage(`${item.name} добавлен в корзину!`);
  };

  if (loading) {
    return <div className="page-loader">Загрузка товара...</div>;
  }

  if (error || !product) {
    return (
      <div className="error-page">
        <h1>Ошибка</h1>
        <p>{error || 'Товар не найден'}</p>
        <Link to="/catalog" className="btn btn--primary">Вернуться в каталог</Link>
      </div>
    );
  }

  const renderValue = (val) => {
    if (val === null || val === undefined) return '—';

    if (typeof val === 'object' && !Array.isArray(val)) {
      return (
        <ul style={{ margin: 0, paddingLeft: '15px' }}>
          {Object.entries(val).map(([subKey, subVal]) => (
            <li key={subKey} style={{ marginBottom: '4px', listStyle: 'none' }}>
              <strong>{subKey}:</strong> {renderValue(subVal)}
            </li>
          ))}
        </ul>
      );
    }

    if (Array.isArray(val)) {
      return val.join(', ');
    }

    return String(val);
  };

  return (
    <div className="product-page">
      {message && <div className="notification">{message}</div>}

      <header className="product-header">
        <Link to="/catalog" className="back-link">
          <span className="icon">←</span> Назад в каталог
        </Link>
      </header>

      <main className="product-main">
        <div className="product-gallery">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="main-image" />
          ) : (
            <div className="no-image-placeholder">Нет изображения</div>
          )}

          {product.discount && (
            <div className="discount-badge">-{product.discount}%</div>
          )}
        </div>

        <div className="product-details">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-meta">
            <span className="category-tag">{product.category || 'Электроника'}</span>

            <div className="rating-block">
              <span className="stars">
                {'★'.repeat(Math.floor(Number(product.rating) || 0))}
              </span>
              <span className="rating-value">
                {Number(product.rating).toFixed(1)} ({product.reviews || 0} отзывов)
              </span>
            </div>
          </div>

          <div className="price-block">
            {product.oldPrice && (
              <span className="price-old">{product.oldPrice} ₽</span>
            )}
            <span className="price-current">{product.price} ₽</span>
          </div>

          <p className="product-description">
            {product.description || 'Описание товара отсутствует.'}
          </p>

          <div className="actions">
            <button
              className={`btn btn--add-to-cart ${!product.inStock ? 'disabled' : ''}`}
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
            >
              {product.inStock ? 'В корзину' : 'Нет в наличии'}
            </button>

            {!product.inStock && (
              <button className="btn btn--outline">Уведомить о поступлении</button>
            )}
          </div>


          {product.specifications && (
            <section className="specifications">
              <h3>Характеристики</h3>
              {typeof product.specifications === 'object' && !Array.isArray(product.specifications) ? (
                <ul className="spec-list">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key} className="spec-item">
                      <span className="spec-label">{key}:</span>
                      <span className="spec-value">{renderValue(value)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="specs-raw-text" style={{ whiteSpace: 'pre-wrap', color: '#555' }}>
                  {product.specifications}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <footer className="product-footer">
        <p>&copy; 2026 TechStore. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default ProductPage;