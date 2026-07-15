import React, { useState, useRef, useEffect } from 'react';
import './Cart.css';

const Cart = ({ cart, setCart }) => {
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState('');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);

  const timeoutRef = useRef(null);


  useEffect(() => {
    fetch('http://localhost/get_cities.php')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCities(data);
          setSelectedCity(data[0]);
        } else {

          setCities([]);
        }
      })
      .catch(() => {
        setCities([]);
      });
  }, []);

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
            } else {
              return null;
            }
          }
          return item;
        })
        .filter(Boolean)
    );
    addMessage('');
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const addMessage = (msg) => {
    setMessage(msg);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setMessage(''), 3000);
  };

  const handleCheckoutClick = () => {
    if (cities.length === 0) {
      alert('Города не загружены. Попробуйте позже.');
      return;
    }
    setIsCityModalOpen(true);
  };

  const handleConfirmOrder = () => {
    setIsCityModalOpen(false);

    const orderData = {
      items: cart,
      total: totalPrice,
      city: selectedCity,
      date: new Date().toISOString(),
    };

    fetch('http://localhost/submit_order.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: orderData }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          setNotification(`Заказ успешно отправлен в г. ${selectedCity}! Спасибо за покупку.`);
          setCart([]);
        } else {
          setNotification('Ошибка при отправке заказа: ' + data.message);
        }
      })
      .catch(() => {
        setNotification('Ошибка сети или сервера.');
      })
      .finally(() => {
        setTimeout(() => setNotification(''), 3000);
      });
  };

  const handleClearCart = () => {
    setCart([]);
    addMessage('Корзина очищена.');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCityModalOpen(false);
    };
    if (isCityModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCityModalOpen]);

  return (
    <div className="cart">
      <div className="cart__container">
        <h1 className="cart__title">Корзина</h1>
        {message && <div className="notification">{message}</div>}

        {cart.length === 0 ? (
          <div className="cart__empty">
            <p>Ваша корзина пуста</p>
            <a href="/catalog" className="cart__continue-shopping">
              Продолжить покупки
            </a>
          </div>
        ) : (
          <>
            <div className="cart__items">
              {cart.map((item) => {
                const imageSrc = item.imageUrl || item.image;
                return (
                  <div key={item.id} className="cart__item">
                    <div className="cart__item-content">
                      <div className="cart__item-image">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={item.name}
                            className="cart__item-img"
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

                      <div className="cart__item-info">
                        <h3 className="cart__item-name">{item.name}</h3>
                        <div className="cart__item-price">
                          Цена: {item.price.toLocaleString('ru-RU')} руб.
                        </div>
                      </div>

                      <div className="cart__item-controls">
                        <button
                          className="cart__quantity-btn"
                          onClick={() => decreaseQuantity(item.id)}
                          aria-label="Уменьшить количество"
                        >
                          -
                        </button>
                        <span className="cart__quantity">{item.quantity}</span>
                        <button
                          className="cart__quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Увеличить количество"
                        >
                          +
                        </button>
                        <button
                          className="cart__remove-btn"
                          onClick={() => removeItem(item.id)}
                          aria-label="Удалить товар"
                        >
                          Удалить
                        </button>
                      </div>

                      <div className="cart__item-total">
                        Итого: {(item.price * item.quantity).toLocaleString('ru-RU')} руб.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart__summary">
              <div className="cart__total">
                <span>Общая сумма:</span>
                <span className="cart__total-amount">
                  {totalPrice.toLocaleString('ru-RU')} руб.
                </span>
              </div>
              <button className="cart__clear-btn" onClick={handleClearCart}>
                Очистить корзину
              </button>
              <button
                className="cart__checkout-btn"
                disabled={cart.length === 0}
                onClick={handleCheckoutClick}
              >
                Оформить заказ
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
              <button className="btn-primary" onClick={handleConfirmOrder} disabled={!selectedCity}>
                Подтвердить заказ
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="bottom-notification">{notification}</div>
      )}
    </div>
  );
};

export default Cart;