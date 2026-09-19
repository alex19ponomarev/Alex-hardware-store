import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';
import Footer from '../Footer/Footer';

const Cart = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState('');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isCheckingAddress, setIsCheckingAddress] = useState(false);

  const timeoutRef = useRef(null);

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetch('/get_cities.php')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCities(data);
          setSelectedCity(data[0]);
        } else {
          setCities([]);
        }
      })
      .catch(() => setCities([]));
  }, []);

  const addMessage = (msg) => {
    setMessage(msg);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMessage(''), 4000);
  };

  const showNotification = (msg, duration = 4000) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), duration);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            if (item.quantity > 1) {
              return { ...item, quantity: item.quantity - 1 };
            }
            return null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckoutClick = () => {
    const user = getUser();
    if (!user) {
      addMessage('Чтобы оформить заказ, войдите в аккаунт');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    if (cities.length === 0) {
      alert('Города не загружены. Попробуйте позже.');
      return;
    }
    setIsCityModalOpen(true);
  };

  const saveOrderToHistory = (orderData) => {
    try {
      const storedUser = getUser();
      const email = storedUser?.email;
      if (!email) return;

      const allHistory = JSON.parse(localStorage.getItem('orderHistory') || '{}');
      const userOrders = allHistory[email] || [];

      const newOrder = {
        id: Date.now(),
        date: orderData.date,
        items: orderData.items,
        total: orderData.total,
        city: orderData.city,
        address: orderData.address,
        status: 'В обработке',
      };

      allHistory[email] = [newOrder, ...userOrders];
      localStorage.setItem('orderHistory', JSON.stringify(allHistory));
    } catch (err) {
      console.error('Не удалось сохранить заказ:', err);
    }
  };


  const checkAddressCensorship = async (address) => {
    try {
      const res = await fetch('/check_censorship.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ text: address }),
      });
      const data = await res.json();
      return data.ok === true;
    } catch {
    
      return true;
    }
  };

  const handleConfirmOrder = async () => {
    const user = getUser();
    if (!user) {
      setIsCityModalOpen(false);
      setIsAddressModalOpen(false);
      addMessage('Чтобы оформить заказ, войдите в аккаунт');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (!deliveryAddress.trim()) {
      alert('Пожалуйста, введите адрес доставки.');
      return;
    }

 
    setIsCheckingAddress(true);
    const ok = await checkAddressCensorship(deliveryAddress);
    setIsCheckingAddress(false);

    if (!ok) {
      showNotification('❌ Адрес содержит недопустимые слова. Измените адрес.', 5000);
      return;
    }


    const orderData = {
      items: cart,
      total: totalPrice,
      city: selectedCity,
      address: deliveryAddress,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch('/submit_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderData }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        showNotification(`✅ Заказ успешно отправлен в г. ${selectedCity}!`, 4000);
        saveOrderToHistory(orderData);
        setCart([]);
        setDeliveryAddress('');
        setIsCityModalOpen(false);
        setIsAddressModalOpen(false);
      } else {
      
        showNotification(`❌ ${data.message || 'Ошибка при отправке заказа'}`, 5000);
      }
    } catch {
      showNotification('❌ Ошибка сети или сервера.', 5000);
    }
  };

  const handleClearCart = () => {
    setCart([]);
    addMessage('Корзина очищена.');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCityModalOpen(false);
        setIsAddressModalOpen(false);
      }
    };
    if (isCityModalOpen || isAddressModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCityModalOpen, isAddressModalOpen]);

  const isLoggedIn = !!getUser();

  return (
    <div className="cart-page-wrap">
      <div className="cart">
        <div className="cart-container">
          <h1 className="cart-title">Корзина</h1>

          {message && <div className="notification">{message}</div>}

          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Ваша корзина пуста</p>
              <Link to="/catalog" className="cart-continue-shopping">
                Продолжить покупки
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => {
                  const imageSrc = item.imageUrl || item.image;
                  return (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={item.name}
                            className="cart-item-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const parent = e.target.parentNode;
                              if (parent && !parent.querySelector('.product-icon')) {
                                const icon = document.createElement('span');
                                icon.className = 'product-icon';
                                icon.textContent = '📦';
                                parent.appendChild(icon);
                              }
                            }}
                          />
                        ) : (
                          <span className="product-icon">📦</span>
                        )}
                      </div>

                      <div className="cart-item-info">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <div className="cart-item-price">
                          Цена: {item.price.toLocaleString('ru-RU')} руб.
                        </div>
                      </div>

                      <div className="cart-item-controls">
                        <button
                          className="cart-quantity-btn"
                          onClick={() => decreaseQuantity(item.id)}
                          aria-label="Уменьшить количество"
                        >
                          -
                        </button>
                        <span className="cart-quantity">{item.quantity}</span>
                        <button
                          className="cart-quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Увеличить количество"
                        >
                          +
                        </button>
                        <button
                          className="cart-remove-btn"
                          onClick={() => removeItem(item.id)}
                          aria-label="Удалить товар"
                        >
                          Удалить
                        </button>
                      </div>

                      <div className="cart-item-total">
                        Итого: {(item.price * item.quantity).toLocaleString('ru-RU')} руб.
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary">
                <div className="cart-total">
                  <span>Общая сумма:</span>
                  <span className="cart-total-amount">
                    {totalPrice.toLocaleString('ru-RU')} руб.
                  </span>
                </div>

                {!isLoggedIn && (
                  <div className="cart-login-warning">
                    <span className="cart-login-warning-icon">⚠️</span>
                    <span>
                      Для оформления заказа необходимо{' '}
                      <Link to="/login" className="cart-login-link">войти в аккаунт</Link>
                    </span>
                  </div>
                )}

                <button className="cart-clear-btn" onClick={handleClearCart}>
                  Очистить корзину
                </button>
                <button
                  className="cart-checkout-btn"
                  disabled={cart.length === 0}
                  onClick={handleCheckoutClick}
                >
                  {isLoggedIn ? 'Оформить заказ' : 'Войти и оформить'}
                </button>
              </div>
            </>
          )}
        </div>

        {isCityModalOpen && (
          <div className="modal-overlay" onClick={() => setIsCityModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Выберите город доставки</h2>
                <button className="close-btn" onClick={() => setIsCityModalOpen(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <select
                  className="city-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  {cities.length > 0 ? (
                    cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))
                  ) : (
                    <option value="">Нет доступных городов</option>
                  )}
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setIsCityModalOpen(false)}>Отмена</button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setIsCityModalOpen(false);
                    setIsAddressModalOpen(true);
                  }}
                  disabled={!selectedCity}
                >
                  Далее
                </button>
              </div>
            </div>
          </div>
        )}

        {isAddressModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAddressModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Введите адрес доставки</h2>
                <button
                  className="close-btn"
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    setDeliveryAddress('');
                  }}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <textarea
                  placeholder="Ваш адрес..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={4}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    setDeliveryAddress('');
                  }}
                >
                  Отмена
                </button>
                <button
                  className="btn-primary"
                  onClick={handleConfirmOrder}
                  disabled={!deliveryAddress.trim() || isCheckingAddress}
                >
                  {isCheckingAddress ? 'Проверка...' : 'Подтвердить заказ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {notification && (
          <div className="bottom-notification">{notification}</div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;