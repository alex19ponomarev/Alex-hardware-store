import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverMessage) {
      setServerMessage('');
      setIsError(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Введите имя';
    else if (formData.name.trim().length < 2) newErrors.name = 'Имя не менее 2 символов';

    if (!formData.email.trim()) newErrors.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Некорректный email';

    if (!formData.password) newErrors.password = 'Введите пароль';
    else if (formData.password.length < 8) newErrors.password = 'Пароль не менее 8 символов';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Подтвердите пароль';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Пароли не совпадают';

    if (!formData.agree) newErrors.agree = 'Необходимо согласие с политикой конфиденциальности';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage('');
    setIsError(false);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/RegisterPage.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        navigate('/login');
      } else {
        setIsError(true);
        setServerMessage(result.message || 'Ошибка регистрации');
      }
    } catch (err) {
      setIsError(true);
      setServerMessage('Ошибка соединения с сервером');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <h2>Регистрация</h2>

      <form onSubmit={handleSubmit} className="register-form" noValidate>
        <div>
          <label>Имя:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            required
            disabled={submitting}
            autoComplete="name"
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            required
            disabled={submitting}
            autoComplete="email"
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div>
          <label>Пароль:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
            required
            disabled={submitting}
            autoComplete="new-password"
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>

        <div>
          <label>Подтверждение пароля:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'error' : ''}
            required
            disabled={submitting}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
        </div>

        <div className="register-agreement">
          <label className="register-agreement-label">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              disabled={submitting}
            />
            <span className="register-agreement-text">
              Я согласен с{' '}
              <Link to="/privacy" target="_blank" rel="noopener noreferrer">
                политикой конфиденциальности
              </Link>{' '}
              и даю согласие на обработку персональных данных
            </span>
          </label>
          {errors.agree && <div className="error-message">{errors.agree}</div>}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Отправка...' : 'Зарегистрироваться'}
        </button>

        {serverMessage && (
          <div className={isError ? 'error-message server-error' : 'success-message'}>
            {serverMessage}
          </div>
        )}
      </form>

      <div className="register-login-link">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </div>
    </div>
  );
};

export default RegisterPage;