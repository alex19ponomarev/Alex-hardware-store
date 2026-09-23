import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductPage.css';
import Footer from '../Footer/Footer';
import { useFavorites } from '../useFavorites/useFavorites';

const ProductPage = ({ cart, setCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/Product.php?id=${id}`);
        if (!response.ok) throw new Error('Товар не найден');
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

  const addToCart = (item) => {
    if (!setCart) return;

    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: (p.quantity || 1) + 1 } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const parseSpecs = (specs) => {
    if (!specs) return [];

    if (typeof specs === 'object' && !Array.isArray(specs)) {
      return Object.entries(specs).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      }));
    }

    const lines = String(specs)
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const result = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.endsWith(':') && line.length < 80) {
        const key = line.slice(0, -1);
        const next = lines[i + 1];
        if (next && !next.endsWith(':')) {
          result.push({ key, value: next });
          i++;
        } else {
          result.push({ key, value: '' });
        }
      }
    }
    return result;
  };

  const renderStars = (rating) => {
    const num = Math.floor(Number(rating) || 0);
    return '★'.repeat(num) + '☆'.repeat(5 - num);
  };

  if (loading) {
    return (
      <div className="product-page-wrap">
        <div className="product-page">
          <div className="product-loader">Загрузка товара...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-page-wrap">
        <div className="product-page">
          <nav className="breadcrumbs" aria-label="Навигация">
            <Link to="/" className="breadcrumbs-link">Главная</Link>
            <span className="breadcrumbs-sep">/</span>
            <Link to="/catalog" className="breadcrumbs-link">Каталог</Link>
            <span className="breadcrumbs-sep">/</span>
            <span className="breadcrumbs-current">Ошибка</span>
          </nav>

          <div className="product-error">
            <h2>Ошибка</h2>
            <p>{error || 'Товар не найден'}</p>
            <Link to="/catalog" className="product-back-btn">← Вернуться в каталог</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const specsList = parseSpecs(product.specifications);
  const fav = isFavorite(product.id);

  return (
    <div className="product-page-wrap">
      <div className="product-page">
        <nav className="breadcrumbs" aria-label="Навигация">
          <Link to="/" className="breadcrumbs-link">Главная</Link>
          <span className="breadcrumbs-sep">/</span>
          <Link to="/catalog" className="breadcrumbs-link">Каталог</Link>
          {product.category && (
            <>
              <span className="breadcrumbs-sep">/</span>
              <Link
                to={`/catalog?category=${encodeURIComponent(product.category)}`}
                className="breadcrumbs-link"
              >
                {product.category}
              </Link>
            </>
          )}
          <span className="breadcrumbs-sep">/</span>
          <span className="breadcrumbs-current" title={product.name}>
            {product.name}
          </span>
        </nav>

        <div className="product-main">
          <div className="product-gallery">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
              />
            ) : (
              <div className="product-no-image">Нет изображения</div>
            )}

            {product.discount > 0 && (
              <span className="product-discount">-{product.discount}%</span>
            )}

            <button
              type="button"
              className={`product-gallery-fav ${fav ? 'active' : ''}`}
              onClick={() => toggleFavorite(product.id)}
              aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
              title={fav ? 'Убрать из избранного' : 'В избранное'}
            >
              {fav ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>

            <div className="product-meta">
              {product.category && (
                <span className="product-category">{product.category}</span>
              )}

              {product.rating > 0 && (
                <div className="product-rating">
                  <span className="product-stars">{renderStars(product.rating)}</span>
                  <span className="product-rating-value">
                    {Number(product.rating).toFixed(1)}
                  </span>
                  <span className="product-reviews">
                    ({product.reviews || 0} отзывов)
                  </span>
                </div>
              )}
            </div>

            <div className="product-price-block">
              {product.oldPrice && (
                <span className="product-price-old">{product.oldPrice} ₽</span>
              )}
              <span className="product-price-current">{product.price} ₽</span>
            </div>

            <div className="product-stock">
              <span className="product-stock-dot"></span>
              <span>В наличии</span>
            </div>

            <div className="product-actions">
              <button
                className={`product-add-btn ${added ? 'added' : ''}`}
                onClick={() => addToCart(product)}
              >
                {added ? '✓ Добавлено' : 'В корзину'}
              </button>

              <button
                type="button"
                className={`product-fav-btn ${fav ? 'active' : ''}`}
                onClick={() => toggleFavorite(product.id)}
                title={fav ? 'Убрать из избранного' : 'В избранное'}
              >
                {fav ? '❤️ В избранном' : '🤍 В избранное'}
              </button>

              <Link to="/cart" className="product-go-cart-btn">
                Перейти в корзину
              </Link>
            </div>
          </div>
        </div>

        {specsList.length > 0 && (
          <section className="product-specs">
            <h2 className="product-specs-title">Характеристики</h2>
            <ul className="spec-list">
              {specsList.map(({ key, value }, idx) => (
                <li key={`${key}-${idx}`} className="spec-item">
                  <span className="spec-label">{key}</span>
                  <span className="spec-value">{value || '—'}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="product-description-block">
          <h2 className="product-description-title">Описание</h2>
          <p className="product-description">
            {product.description || 'Описание товара отсутствует.'}
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ProductPage;