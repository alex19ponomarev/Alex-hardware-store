import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

    if (!agree) {
      newErrors.agree = 'Необходимо согласие с политикой конфиденциальности';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoginSuccessMessage('');
      return;
    }

    try {
      const response = await fetch('/LoginPage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: formData.email,
          password: formData.password,
        }),
      });
      const result = await response.json();

      if (result.status === 'success') {
        localStorage.setItem('user', JSON.stringify({ email: result.email }));

        if (onLogin) {
          onLogin({ email: result.email });
        }

        setLoginSuccessMessage(`Вход выполнен! Добро пожаловать, ${result.email}`);
        setFormData({ email: '', password: '' });
        setAgree(false);
        setErrors({});

        navigate('/catalog');
      } else {
        setErrors({});
        setLoginSuccessMessage('');
        alert(result.message || 'Ошибка входа');
      }
    } catch (error) {
      setErrors({});
      setLoginSuccessMessage('');
      alert('Ошибка соединения с сервером');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="login-page">
      <h2>Войти</h2>
      <form onSubmit={handleSubmit} className="login-form" noValidate>
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


        <div className="login-agreement">
          <label className="login-agreement-label">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                if (errors.agree) setErrors(prev => ({ ...prev, agree: '' }));
              }}
            />
            <span className="login-agreement-text">
              Я согласен с{' '}
              <Link to="/privacy" target="_blank" rel="noopener noreferrer">
                политикой конфиденциальности
              </Link>{' '}
              и даю согласие на обработку персональных данных
            </span>
          </label>
          {errors.agree && <div className="error-message">{errors.agree}</div>}
        </div>

        <button type="submit">Войти</button>
      </form>
      {loginSuccessMessage && <div className="success-message">{loginSuccessMessage}</div>}

      <div className="login-register-link">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </div>
    </div>
  );
};

export default LoginPage;