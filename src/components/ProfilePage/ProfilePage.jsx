import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');


  const loadUserData = () => {
    const storedData = localStorage.getItem('userProfile');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    };
  };


  const initialData = loadUserData();

  const [formData, setFormData] = useState(initialData);


  const handleSave = () => {
    setIsEditing(false);
    localStorage.setItem('userProfile', JSON.stringify(formData));
    setMessage('Данные профиля успешно обновлены!');
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }

    localStorage.removeItem('userProfile');
    navigate('/');
  };

  const handleEditToggle = () => setIsEditing((prev) => !prev);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      <main className="profile-main">
        <section className="profile-card">
          <div className="profile-avatar">
            <span className="avatar-initial">{user.name?.[0]?.toUpperCase() || '😎'}</span>
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
                  onChange={handleInputChange}
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
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Бонусы</span>
              <span className="stat-value">0 ₽</span>
            </div>
          </div>

          <div className="quick-actions">
            <button className="action-btn">История заказов</button>
            <button className="action-btn">Избранное</button>
          </div>
        </aside>
      </main>

      <footer className="profile-footer">
        <p>&copy; {new Date().getFullYear()} AlexTechStore. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Profile;