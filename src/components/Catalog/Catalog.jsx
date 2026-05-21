import React, { useState, useEffect } from 'react';
import './Catalog.css';
import { useSearchParams } from 'react-router-dom';
import productImage from '../../assets/images/2258685cc32bbd96de406852bd9b2d94916029658cd6fa120a9f97a4bc0af297.jpg.webp';
import productImage2 from '../../assets/images/f8c1d514292bd887b7279a1fa5f26692c8c70e6dd1ca86b6a8a7b3a4f4b6b0bd.jpg.webp';
import productImage3 from '../../assets/images/73dd06c0a2d4c9ff74cfaafaedec60012cae0a437e72ed35351e0fa8fa203289.jpg.webp';
import productImage4 from '../../assets/images/4c50e9737ae8188a63bd98b1bfeb429bef560e3599fea1c03b45e8d06bb400cb.jpg.webp';
import productImage5 from '../../assets/images/6d15582c93b7c52895ebbec99067b3d5c1bf6f1c3492f3eb03c03b7c0d912498.jpg.webp';
import productImage6 from '../../assets/images/f669b852c62ac46ba3ee888d63a43d8a5d896a1f38e2cca75c142f3d87eaf909.jpg.webp';
import productImage7 from '../../assets/images/d242d02b93b30a304475ef2569e05a4b67123d1c80fec310082000dbb8f7995c.jpg.webp';
import productImage8 from '../../assets/images/831a385f76f265293448bc5b858ab3d74053e6cf4ada47e0649b959d7bcb5567.jpg.webp';
import productImage9 from '../../assets/images/ad01cc5e1b26d2babbb87e8bbaacce13612222ffb9b39b939605a9023e9c8f03.png.webp';
import productImage10 from '../../assets/images/98ebc786ba1821e79ded93dfb338087cabbbe840a96d389b8151c615f27420d7.jpg.webp';
import productImage11 from '../../assets/images/ab7c0179d9f377fc23be740ae96168658c20a36166f7877887620fccdf3287a7.jpg.webp';
import productImage12 from '../../assets/images/463aa9acfebc92bf7dd1c5809e07036bde6049290d3f889d2f99e8656809e472.jpg.webp';
import productImage13 from '../../assets/images/313c94e5085fa534b5afa8c9af2c45d36bf847fa53e577853ecd7ee1d25b38eb.jpg.webp';
import productImage14 from '../../assets/images/7dde57929a7052a80ee0cb23bea558c3e2fefe222cb4e3c3b38015d9e9585f6f.jpg.webp';
import productImage15 from '../../assets/images/0f34320499fd55046f4822350223b874d505d500e0d89a1e085930872efb4382.jpg.webp';
import productImage16 from '../../assets/images/adf8895f945cd0f3a6b18228277567ef9b981ca302d637c2af58c09392e5ec8b.jpg.webp';
import productImage17 from '../../assets/images/233b16db498c1ceb275ed36d54b4a96fa6d508afb8a0cef8a392a4408f27b3aa.jpg.webp';
import productImage18 from '../../assets/images/b5c2c5363e1aa5ddf78130ca0a97ba36de62a1dff4ef5012e0944c5c0ccf52df.jpg.webp';
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
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: '6.1" Смартфон Apple iPhone 15 128 ГБ черный',
        price: 56999 ,
        oldPrice: 60999,
        discount: 14,
        category: 'Смартфоны',
        rating: 4.8,
        reviews: 124,
        image: productImage
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
        image: productImage2
      },
      {
        id: 3,
        name: 'Беспроводные наушники Logitech G435 черный 2021',
        price: 4999,
        oldPrice: 6499,
        discount: 23,
        category: 'Аудиотехника',
        rating: 4.7,
        reviews: 201,
        image: productImage3
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
        image: productImage4
      },
      {
        id: 5,
        name: '43" (108 см) Телевизор Xiaomi TV A 43 2026 черный',
        price: 25999,
        oldPrice: 32999,
        discount: 13,
        category: 'Телевизоры',
        rating: 4.5,
        reviews: 92,
        image: productImage5
      },
      {
        id: 6,
        name: 'Смарт-часы Apple Watch SE 3 40 mm',
        price: 26099,
        oldPrice: 28999,
        discount: 2,
        category: 'Умные часы',
        rating: 4.4,
        reviews: 156,
        image: productImage6
      },
      {
        id: 7,
        name: '6.67" Смартфон Xiaomi Redmi Note 14 256 ГБ черный',
        price: 56999 ,
        oldPrice: 60999,
        discount: 14,
        category: 'Смартфоны',
        rating: 4.8,
        reviews: 124,
        image: productImage7
      },
        {
        id: 8,
        name: '6.7" Смартфон Samsung Galaxy A56 256 ГБ черный',
        price: 32999 ,
        oldPrice: 60999,
        discount: 14,
        category: 'Смартфоны',
        rating: 4.8,
        reviews: 124,
        image: productImage8
      },
          {
        id: 9,
        name: '13.6" Ноутбук Apple MacBook Air M4 серебристый',
        price: 94999,
        oldPrice: 105499,
        discount: 14,
        category: 'Ноутбуки',
        rating: 4.8,
        reviews: 124,
        image: productImage9
      },
          {
        id: 10,
        name: '17.3" Ноутбук ASUS TUF Gaming FX707VJ-HX015 серый',
        price: 88999 ,
        oldPrice: 90999,
        discount: 14,
        category: 'Ноутбуки',
        rating: 4.8,
        reviews: 124,
        image: productImage10
      },
     {
        id: 11,
        name: '24" (61 см) Телевизор Aceline 24HEN2 черный',
        price: 6199,
        oldPrice: 10000,
        discount: 14,
        category: 'Телевизоры',
        rating: 4.8,
        reviews: 124,
        image: productImage11
      },
 {
        id: 12,
        name: '50" (127 см) Телевизор Xiaomi TV A Pro 50 2026 черный',
        price: 32999,
        oldPrice: 40999,
        discount: 14,
        category: 'Телевизоры',
        rating: 4.8,
        reviews: 124,
        image: productImage12
      },
     {
        id: 13,
        name: 'Наушники TWS Apple AirPods Pro 3 белый 2025',
        price: 23499,
        oldPrice: 30499,
        discount: 23,
        category: 'Аудиотехника',
        rating: 4.7,
        reviews: 201,
        image: productImage13
      },
         {
        id: 14,
        name: 'Беспроводные/проводные наушники Marshall Major V черный 2024',
        price: 8199,
        oldPrice: 9499,
        discount: 23,
        category: 'Аудиотехника',
        rating: 4.7,
        reviews: 201,
        image: productImage14
      },
       {
        id: 15,
        name: '11" Планшет Apple iPad (11th Gen) Wi-Fi 128 ГБ розовый',
        price: 30999,
        oldPrice: 35999,
        discount: 20,
        category: 'Планшеты',
        rating: 4.6,
        reviews: 76,
        image: productImage15
      },
       {
        id: 16,
        name: '11" Планшет Xiaomi REDMI Pad 2 Wi-Fi 256 ГБ серый',
        price: 18599,
        oldPrice: 24999,
        discount: 20,
        category: 'Планшеты',
        rating: 4.6,
        reviews: 76,
        image: productImage16
      },
    {
        id: 17,
        name: 'Фитнес-браслет Xiaomi Smart Band 10',
        price:3699,
        oldPrice: 4000,
        discount: 2,
        category: 'Умные часы',
        rating: 4.4,
        reviews: 156,
        image: productImage17
      },
     {
        id: 18,
        name: 'Смарт-часы HUAWEI WATCH GT 6 Pro 46 mm',
        price: 21199,
        oldPrice: 28999,
        discount: 2,
        category: 'Умные часы',
        rating: 4.4,
        reviews: 156,
        image: productImage18
      },
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
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

    addMessage(`${product.name} добавлен в корзину!`);
  };
  useEffect(() => {
    let result = [...products];

    if (selectedCategory !== 'Все категории') {
      result = result.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(product =>
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
        result.sort((a, b) => b.rating - a.rating);
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
                {categories.map((category) => (
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
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
            <div className="product-card__image">
  <img src={product.image} alt={product.name} className="product-image" />
  {product.discount && (
    <span className="discount-badge">-{product.discount}%</span>
  )}
</div>
                <div className="product-card__info">
                  <h3 className="product-card__title">{product.name}</h3>
                  <div className="product-rating">
                    <span className="rating-stars">{'★'.repeat(Math.floor(product.rating))}</span>
                    <span className="rating-value">{product.rating}</span>
                    <span className="rating-reviews">({product.reviews})</span>
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
          ) : (
            <p>Товары не найдены</p>
          )}
       
        </div>
      </div>
  
    </div>
  );
};

export default Catalog;