import React, { useState } from 'react';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Пожалуйста, введите имя';
    }
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
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Пожалуйста, подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage('');
      return;
    }

    setSuccessMessage(`Регистрация прошла успешно! Добро пожаловать, ${formData.name}!`);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  return (
    <div className="register-page">
      <h2>Регистрация</h2>
      <form action="http://localhost/RegisterPage.php" method='post' className="register-form" noValidate>
        <div>
          <label>Имя:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            required
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
          />
          {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default RegisterPage;