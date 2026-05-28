import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Пожалуйста, введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пожалуйста, введите пароль';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен быть не менее 8 символов';
    }

    return newErrors;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoginSuccessMessage('');
      return;
    }
    setLoginSuccessMessage(`Вход выполнен! Добро пожаловать!`);
    setFormData({ email: '', password: '' });
    setErrors({});
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="login-page">
      <h2>Войти</h2>
      <form action="http://localhost/LoginPage.php" method='post' className="login-form" noValidate>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            required
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>
        <div className="password-group">
          <label>Пароль:</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              required
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="toggle-password"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>
        <button type="submit">Войти</button>
      </form>
      {loginSuccessMessage && <div className="success-message">{loginSuccessMessage}</div>}
    </div>
  );
};

export default LoginPage;