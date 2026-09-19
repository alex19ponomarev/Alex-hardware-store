import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Footer from '../Footer/Footer';
import { useFavorites } from '../useFavorites/useFavorites';
import bannerImage from '../../assets/images/73dd06c0a2d4c9ff74cfaafaedec60012cae0a437e72ed35351e0fa8fa203289.jpg.webp';

const Home = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  const addToCart = (product) => {
    if (!setCart) return;

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
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/productsHome.php');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loading">Загрузка товаров...</div>;
  if (error) return <div className="error">Ошибка загрузки: {error}</div>;

  return (
    <div>
      <main className="home">
        <section className="hero">
          <div className="hero-content">
            <h1>TechStore — техника для жизни</h1>
            <p>Широкий выбор электроники и бытовой техники по выгодным ценам</p>
            <Link to="/catalog" className="hero-btn">
              Перейти в каталог
            </Link>
          </div>
          <div className="hero-image">
            <img src={bannerImage} alt="Главный баннер" className="banner-image" />
          </div>
        </section>

        <section className="categories">
          <h2 className="section-title">Популярные категории</h2>
          <div className="categories-grid">
            <Link to="/catalog?category=Смартфоны" className="category-card">
              <div className="category-card-image">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#3498db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h3>Смартфоны</h3>
            </Link>

            <Link to="/catalog?category=Ноутбуки" className="category-card">
              <div className="category-card-image">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#3498db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <line x1="2" y1="20" x2="22" y2="20" />
                </svg>
              </div>
              <h3>Ноутбуки</h3>
            </Link>

            <Link to="/catalog?category=Телевизоры" className="category-card">
              <div className="category-card-image">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#3498db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="13" rx="2" />
                  <polyline points="8 3 12 7 16 3" />
                </svg>
              </div>
              <h3>Телевизоры</h3>
            </Link>

            <Link to="/catalog?category=Аудиотехника" className="category-card">
              <div className="category-card-image">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#3498db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
              <h3>Аудиотехника</h3>
            </Link>
          </div>
        </section>

        <section className="featured-products">
          <h2 className="section-title">Хиты продаж</h2>
          <div className="products-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-card-image">
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

                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                    />
                  </div>
                  <h3>{product.name}</h3>
                  <p className="product-card-price">{product.price} ₽</p>
                  <button
                    className="product-card-btn"
                    onClick={() => addToCart(product)}
                  >
                    В корзину
                  </button>
                </div>
              ))
            ) : (
              <p>Товаров пока нет</p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;