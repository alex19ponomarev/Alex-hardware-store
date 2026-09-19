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