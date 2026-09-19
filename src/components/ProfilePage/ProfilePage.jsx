import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css';
import { useFavorites } from '../useFavorites/useFavorites';

const STORAGE_KEY = 'userProfiles';
const OLD_STORAGE_KEY = 'userProfile';
const HISTORY_KEY = 'orderHistory';

const Profile = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favProducts, setFavProducts] = useState([]);
  const [favLoading, setFavLoading] = useState(false);

  const { favorites, toggleFavorite, clearFavorites } = useFavorites();

  const readAllProfiles = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  };

  const saveAllProfiles = (profiles) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  };

  const loadUserData = () => {
    if (!user?.email) {
      return { name: '', email: '', phone: '', address: '', avatar: '' };
    }

    const profiles = readAllProfiles();
    if (profiles[user.email]) return profiles[user.email];

    try {
      const oldData = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY));
      if (oldData && oldData.email === user.email) {
        profiles[user.email] = oldData;
        saveAllProfiles(profiles);
        return oldData;
      }
    } catch {

    }

    return {
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      avatar: '',
    };
  };

  const saveUserData = (data) => {
    if (!user?.email) return;
    const profiles = readAllProfiles();
    profiles[user.email] = data;
    saveAllProfiles(profiles);
    window.dispatchEvent(new Event('userProfileUpdated'));
  };

  const [formData, setFormData] = useState(loadUserData);

  const loadOrders = () => {
    if (!user?.email) return [];
    try {
      const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
      return allHistory[user.email] || [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    setOrders(loadOrders());

  }, [user, showOrders]);

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const toggleOrderExpand = (id) =>
    setExpandedOrder((prev) => (prev === id ? null : id));

  const clearOrderHistory = () => {
    if (!user?.email) return;
    if (!window.confirm('Удалить всю историю заказов?')) return;

    try {
      const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
      delete allHistory[user.email];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
      setOrders([]);
    } catch {

    }
  };


  useEffect(() => {
    if (!showFavorites || favorites.length === 0) {
      setFavProducts([]);
      return;
    }
    const load = async () => {
      setFavLoading(true);
      try {
        const res = await fetch('/Catalog.php');
        const data = await res.json();
        if (data.success) {
          const filtered = data.data.filter((p) => favorites.includes(p.id));
          setFavProducts(filtered);
        }
      } catch {
        setFavProducts([]);
      } finally {
        setFavLoading(false);
      }
    };
    load();
  }, [showFavorites, favorites]);

  const handleSave = () => {
    setIsEditing(false);
    saveUserData(formData);
    setMessage('Данные профиля успешно обновлены!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    localStorage.removeItem(OLD_STORAGE_KEY);
    navigate('/');
  };

  const handleEditToggle = () => setIsEditing((prev) => !prev);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPhone = (value) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (digits && !digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);
    if (!digits) return '';
    const parts = ['+7'];
    if (digits.length > 1) parts.push(' (' + digits.slice(1, 4));
    if (digits.length >= 4) parts.push(') ' + digits.slice(4, 7));
    if (digits.length >= 7) parts.push('-' + digits.slice(7, 9));
    if (digits.length >= 9) parts.push('-' + digits.slice(9, 11));
    return parts.join('');
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Можно загрузить только изображение');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Файл слишком большой (максимум 5 МБ)');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);

        const updated = { ...formData, avatar: compressed };
        setFormData(updated);
        saveUserData(updated);
        setMessage('Аватарка обновлена!');
        setTimeout(() => setMessage(''), 3000);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAvatarDelete = (e) => {
    e.stopPropagation();
    const updated = { ...formData, avatar: '' };
    setFormData(updated);
    saveUserData(updated);
    setMessage('Аватарка удалена');
    setTimeout(() => setMessage(''), 3000);
  };


  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-unauthorized">
          <h1>Профиль</h1>
          <p>Вы не авторизованы. Пожалуйста, войдите в систему.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>Мой профиль</h1>
        <button onClick={handleLogout} className="btn-logout">
          Выйти
        </button>
      </header>

      {message && <div className="profile-notification">{message}</div>}

      <main className="profile-main">
        <section className="profile-card">
          <div className="profile-avatar-wrapper">
            <div
              className="profile-avatar"
              onClick={handleAvatarClick}
              title="Нажмите, чтобы загрузить аватарку"
            >
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Аватар"
                  className="profile-avatar-img"
                />
              ) : (
                <span className="avatar-initial">
                  {user.name?.[0]?.toUpperCase() || '😎'}
                </span>
              )}
              <div className="avatar-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>

            {formData.avatar && (
              <button
                type="button"
                className="avatar-delete-btn"
                onClick={handleAvatarDelete}
                title="Удалить аватарку"
              >
                ×
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="avatar-input"
            />
          </div>

          <h2 className="profile-name">{user.name || 'Пользователь'}</h2>
          <p className="profile-email">{user.email}</p>

          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="form-group">
                <label htmlFor="phone">Телефон</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (___) ___-__-__"
                  maxLength={18}
                  inputMode="tel"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Адрес доставки</label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Город, улица, дом, квартира"
                ></textarea>
              </div>
              <div className="profile-actions">
                <button type="submit" className="btn-save">Сохранить</button>
                <button type="button" onClick={handleEditToggle} className="btn-cancel">
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-info">
                <p><strong>Телефон:</strong> {formData.phone || 'Не указан'}</p>
                <p><strong>Адрес доставки:</strong> {formData.address || 'Не указан'}</p>
              </div>
              <button onClick={handleEditToggle} className="btn-edit">
                Редактировать профиль
              </button>
            </>
          )}
        </section>

        <aside className="profile-sidebar">
          <div className="stats-card">
            <h3>Статистика</h3>
            <div className="stat-item">
              <span className="stat-label">Заказы</span>
              <span className="stat-value">{orders.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Бонусы</span>
              <span className="stat-value">0 ₽</span>
            </div>
          </div>

          <div className="quick-actions">
            <button
              className="action-btn action-btn--primary"
              onClick={() => setShowOrders(true)}
            >
              📦 История заказов
            </button>
            <button
              className="action-btn action-btn--primary"
              onClick={() => setShowFavorites(true)}
            >
              ❤️ Избранное ({favorites.length})
            </button>
          </div>
        </aside>
      </main>


      {showOrders && (
        <div className="orders-modal-overlay" onClick={() => setShowOrders(false)}>
          <div className="orders-modal" onClick={(e) => e.stopPropagation()}>
            <div className="orders-modal-header">
              <h2>История заказов</h2>
              <button className="orders-modal-close" onClick={() => setShowOrders(false)}>×</button>
            </div>
            <div className="orders-modal-body">
              {orders.length === 0 ? (
                <div className="orders-empty">
                  <div className="orders-empty-icon">📦</div>
                  <p>У вас пока нет заказов</p>
                  <button className="btn-primary" onClick={() => { setShowOrders(false); navigate('/catalog'); }}>
                    Перейти в каталог
                  </button>
                </div>
              ) : (
                <>
                  <div className="orders-list">
                    {orders.map((order) => {
                      const isExpanded = expandedOrder === order.id;
                      const itemsCount = order.items.reduce((sum, it) => sum + (it.quantity || 1), 0);
                      return (
                        <div key={order.id} className="order-card">
                          <div className="order-card-head" onClick={() => toggleOrderExpand(order.id)}>
                            <div className="order-card-info">
                              <div className="order-card-number">Заказ №{String(order.id).slice(-6)}</div>
                              <div className="order-card-date">{formatDate(order.date)}</div>
                            </div>
                            <div className="order-card-status">
                              <span className="order-status-badge">{order.status}</span>
                            </div>
                            <div className="order-card-total">
                              {order.total.toLocaleString('ru-RU')} ₽
                            </div>
                            <div className={`order-card-arrow ${isExpanded ? 'expanded' : ''}`}>▾</div>
                          </div>
                          <div className="order-card-meta">
                            <span>🚚 {order.city}, {order.address}</span>
                            <span>📦 Товаров: {itemsCount}</span>
                          </div>
                          {isExpanded && (
                            <div className="order-card-details">
                              <h4>Состав заказа</h4>
                              <ul className="order-items">
                                {order.items.map((item, idx) => (
                                  <li key={idx} className="order-item">
                                    <div className="order-item-name">{item.name}</div>
                                    <div className="order-item-qty">
                                      {item.quantity} × {item.price.toLocaleString('ru-RU')} ₽
                                    </div>
                                    <div className="order-item-sum">
                                      {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button className="orders-clear-btn" onClick={clearOrderHistory}>
                    Очистить историю
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Избранное */}
      {showFavorites && (
        <div className="orders-modal-overlay" onClick={() => setShowFavorites(false)}>
          <div className="orders-modal" onClick={(e) => e.stopPropagation()}>
            <div className="orders-modal-header">
              <h2>Избранное</h2>
              <button className="orders-modal-close" onClick={() => setShowFavorites(false)}>×</button>
            </div>
            <div className="orders-modal-body">
              {favLoading && <div className="favorites-loading">Загрузка...</div>}

              {!favLoading && favProducts.length === 0 && (
                <div className="orders-empty">
                  <div className="orders-empty-icon">❤️</div>
                  <p>В избранном пока ничего нет</p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowFavorites(false);
                      navigate('/catalog');
                    }}
                  >
                    В каталог
                  </button>
                </div>
              )}

              {!favLoading && favProducts.length > 0 && (
                <>
                  <div className="favorites-list">
                    {favProducts.map((p) => (
                      <div key={p.id} className="favorite-item">
                        <div className="favorite-item-img">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <div className="favorite-item-info">
                          <Link
                            to={`/product/${p.id}`}
                            className="favorite-item-name"
                            onClick={() => setShowFavorites(false)}
                          >
                            {p.name}
                          </Link>
                          <div className="favorite-item-price">
                            {p.price.toLocaleString('ru-RU')} ₽
                          </div>
                        </div>
                        <div className="favorite-item-actions">
                          <button
                            className="favorite-remove-btn"
                            onClick={() => toggleFavorite(p.id)}
                            title="Убрать из избранного"
                          >
                            ❤️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="orders-clear-btn" onClick={clearFavorites}>
                    Очистить избранное
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="profile-footer">
        <p>&copy; {new Date().getFullYear()} AlexTechStore. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Profile;