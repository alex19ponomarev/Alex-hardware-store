import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'favorites';

const getKey = (email) => (email ? email : 'guest');

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || {};
  } catch {
    return {};
  }
};

const getUserFavorites = (email) => {
  const all = readAll();
  return all[getKey(email)] || [];
};

const writeUserFavorites = (email, list) => {
  const all = readAll();
  all[getKey(email)] = list;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(all));
};

const isLoggedIn = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return !!user?.email;
  } catch {
    return false;
  }
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return getUserFavorites(user?.email);
  });

  useEffect(() => {
    const sync = () => {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      setFavorites(getUserFavorites(user?.email));
    };
    window.addEventListener('favoritesUpdated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('favoritesUpdated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggleFavorite = (productId) => {

    if (!isLoggedIn()) {

      const msg = document.createElement('div');
      msg.textContent = '⚠️ Войдите в аккаунт, чтобы добавить в избранное';
      msg.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #2c3e50;
        color: #fff;
        padding: 14px 24px;
        border-radius: 8px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        z-index: 10000;
        font-size: 14px;
        font-weight: 600;
        font-family: Arial, sans-serif;
      `;
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 2500);

      setTimeout(() => {
        window.location.hash = '#/login';
      }, 1500);

      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const email = user?.email;

    const current = getUserFavorites(email);
    const updated = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    writeUserFavorites(email, updated);
    setFavorites(updated);
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const isFavorite = (id) => favorites.includes(id);

  const clearFavorites = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    writeUserFavorites(user?.email, []);
    setFavorites([]);
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  return { favorites, toggleFavorite, isFavorite, clearFavorites };
};