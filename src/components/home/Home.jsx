import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import bannerImage from '../../assets/images/73dd06c0a2d4c9ff74cfaafaedec60012cae0a437e72ed35351e0fa8fa203289.jpg.webp'; 
import vkIcon from '../../assets/icons/VK.com-logo.svg.png';
import telegramIcon from '../../assets/icons/Telegram_logo.svg.png';
import messengerMaxIcon from '../../assets/icons/max.webp';
const Home = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const addToCart = (product) => {
    if (!setCart) {
      console.error('setCart не передан в компонент Home');
      return;
    }

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

        const response = await fetch('http://localhost/productsHome.php'); 
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
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
          <div className="hero__content">
            <h1>TechStore — техника для жизни</h1>
            <p>Широкий выбор электроники и бытовой техники по выгодным ценам</p>
            <Link to="/catalog" className="hero__btn">
              Перейти в каталог
            </Link>
          </div>
          <div className="hero__image">
        <img src={bannerImage} alt="Главный баннер" className="banner-image" />
    </div>
        </section>

        <section className="categories">

          <h2 className="section-title">Популярные категории</h2>
          <div className="categories__grid">
            <Link to="/catalog?category=Смартфоны" className="category-card">
              <div className="category-card__image placeholder-image">📱</div>
              <h3>Смартфоны</h3>
            </Link>
            <Link to="/catalog?category=Ноутбуки" className="category-card">
              <div className="category-card__image placeholder-image">💻</div>
              <h3>Ноутбуки</h3>
            </Link>
            <Link to="/catalog?category=Телевизоры" className="category-card">
              <div className="category-card__image placeholder-image">📺</div>
              <h3>Телевизоры</h3>
            </Link>
            <Link to="/catalog?category=Аудиотехника" className="category-card">
              <div className="category-card__image placeholder-image">🎵</div>
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
                  <div className="product-card__image">
   
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="product-image" 
                      loading="lazy"
                    />
                  </div>
                  <h3>{product.name}</h3>
                  <p className="product-card__price">{product.price} ₽</p>
                  <button
                    className="product-card__btn"
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


       <footer className="footer">
  <div className="footer__container">
    <div className="footer__section">
      <h3 className="footer__title">О магазине</h3>
      <p>TechStore — ваш надёжный поставщик электроники и бытовой техники с 2026 года.</p>
    </div>

    <div className="footer__section">
      <h3 className="footer__title">Категории</h3>
      <ul className="footer__links">
        <li><Link to="/catalog?category=Смартфоны">Смартфоны</Link></li>
        <li><Link to="/catalog?category=Ноутбуки">Ноутбуки</Link></li>
        <li><Link to="/catalog?category=Телевизоры">Телевизоры</Link></li>
        <li><Link to="/catalog?category=Аудиотехника">Аудиотехника</Link></li>
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
export default Home;