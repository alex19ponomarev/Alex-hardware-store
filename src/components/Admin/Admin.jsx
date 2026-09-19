import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const API = '/admin_api.php';

const getUserEmail = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')?.email || '';
  } catch { return ''; }
};

const api = async (action, body = null, method = 'POST') => {
  const url = `${API}?action=${action}&email=${encodeURIComponent(getUserEmail())}`;
  const opts = { method };
  if (body) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify({ ...body, email: getUserEmail() });
  }
  const res = await fetch(url, opts);
  return res.json();
};

const useConfirm = () => {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        title: 'Подтвердите действие',
        message: 'Вы уверены?',
        confirmText: 'OK',
        cancelText: 'Отмена',
        variant: 'danger',
        ...options,
      });
    });
  }, []);

  const handleClose = (result) => {
    setState(null);
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  const ModalNode = state ? (
    <ConfirmModal
      {...state}
      onConfirm={() => handleClose(true)}
      onCancel={() => handleClose(false)}
    />
  ) : null;

  return { confirm, ConfirmNode: ModalNode };
};

const ConfirmModal = ({ title, message, confirmText, cancelText, variant = 'danger', onConfirm, onCancel }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel, onConfirm]);

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icon confirm-icon--${variant}`}>
          {variant === 'danger' ? '⚠️' : variant === 'warning' ? '❓' : 'ℹ️'}
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn confirm-btn--cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`confirm-btn confirm-btn--${variant}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [accessChecked, setAccessChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  useEffect(() => {
    api('check', null, 'GET').then((d) => {
      setIsAdmin(d.isAdmin === true);
      setAccessChecked(true);
    }).catch(() => {
      setIsAdmin(false);
      setAccessChecked(true);
    });
  }, []);

  if (!accessChecked) {
    return <div className="admin-loading">Проверка доступа...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <h1>Доступ запрещён</h1>
        <p>У вас нет прав администратора.</p>
        <button onClick={() => navigate('/')} className="admin-btn admin-btn--primary">
          На главную
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Дашборд' },
    { id: 'products',  label: '📦 Товары' },
    { id: 'orders',    label: '🛒 Заказы' },
    { id: 'users',     label: '👥 Пользователи' },
    { id: 'banned',    label: '🚫 Стоп-слова' },
    { id: 'cities',    label: '🏙️ Города' },
    { id: 'sales',     label: '🔥 Акции' },
  ];

  return (
    <div className="admin">
      <div className="admin-container">
        <header className="admin-header">
          <h1>Админ-панель</h1>
          <button onClick={() => navigate('/')} className="admin-btn admin-btn--secondary">
            ← На сайт
          </button>
        </header>

        <nav className="admin-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`admin-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="admin-content">
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'products'  && <Products  toast={showToast} />}
          {tab === 'orders'    && <Orders    toast={showToast} />}
          {tab === 'users'     && <Users     toast={showToast} />}
          {tab === 'banned'    && <Banned    toast={showToast} />}
          {tab === 'cities'    && <Cities    toast={showToast} />}
          {tab === 'sales'     && <Sales     toast={showToast} />}
        </div>
      </div>

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api('stats', null, 'GET').then((d) => {
      if (d.success) setStats(d.data);
    });
  }, []);

  if (!stats) return <div className="admin-loading">Загрузка...</div>;

  const cards = [
    { label: 'Товаров',        value: stats.products, color: '#3498db' },
    { label: 'Заказов',        value: stats.orders,   color: '#e74c3c' },
    { label: 'Пользователей',  value: stats.users,    color: '#27ae60' },
    { label: 'Стоп-слов',      value: stats.banned,   color: '#8e44ad' },
    { label: 'Городов',        value: stats.cities,   color: '#f39c12' },
    { label: 'Выручка, ₽',     value: Number(stats.revenue).toLocaleString('ru-RU'), color: '#16a085' },
  ];

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card" style={{ borderTopColor: c.color }}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children, footer }) => (
  <div className="admin-modal-overlay" onClick={onClose}>
    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
      <div className="admin-modal-header">
        <h2>{title}</h2>
        <button className="admin-modal-close" onClick={onClose}>×</button>
      </div>
      <div className="admin-modal-body">{children}</div>
      {footer && <div className="admin-modal-footer">{footer}</div>}
    </div>
  </div>
);

const ImageUpload = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`${API}?action=upload_image&email=${encodeURIComponent(getUserEmail())}`, {
        method: 'POST',
        body: fd,
      });
      const d = await res.json();
      if (d.success) {
        onChange(d.filename);
      } else {
        alert(d.message);
      }
    } catch {
      alert('Ошибка загрузки');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="image-upload">
      <input
        type="text"
        placeholder="Имя файла или загрузите"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? 'Загрузка...' : '📁 Загрузить'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      {value && (
        <img
          src={`/assets/images/${value}`}
          alt=""
          className="image-upload-preview"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
    </div>
  );
};

const emptyProduct = {
  id: 0, name: '', price: '', oldPrice: '', discount: '',
  category: '', rating: 5, reviews: 0, image: '',
  description: '', specifications: '',
};

const Products = ({ toast }) => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { confirm, ConfirmNode } = useConfirm();

  const load = () => {
    setLoading(true);
    api('products.list', null, 'GET').then((d) => {
      if (d.success) setItems(d.data);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const save = async () => {
    const d = await api('products.save', editing);
    if (d.success) { toast('✅ ' + d.message); setEditing(null); load(); }
    else toast('❌ ' + d.message);
  };

  const remove = async (id, name) => {
    const ok = await confirm({
      title: 'Удалить товар?',
      message: `«${name}» будет удалён из каталога. Это действие нельзя отменить.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });
    if (!ok) return;
    const d = await api('products.delete', { id });
    if (d.success) { toast('✅ ' + d.message); load(); }
  };

  const upd = (k, v) => setEditing((p) => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Товары ({items.length})</h2>
        <button className="admin-btn admin-btn--primary" onClick={() => setEditing({ ...emptyProduct })}>
          + Добавить товар
        </button>
      </div>

      {loading ? <div className="admin-loading">Загрузка...</div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Фото</th><th>Название</th>
              <th>Цена</th><th>Категория</th><th>Оценка</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.image ? (
                    <img src={`/assets/images/${p.image}`} alt="" className="admin-thumb"
                         onError={(e) => { e.target.style.visibility='hidden'; }} />
                  ) : '—'}
                </td>
                <td>{p.name}</td>
                <td>{Number(p.price).toLocaleString('ru-RU')} ₽</td>
                <td>{p.category}</td>
                <td>{p.rating}</td>
                <td className="admin-row-actions">
                  <button className="admin-btn admin-btn--small" onClick={() => setEditing(p)}>✏️</button>
                  <button className="admin-btn admin-btn--danger admin-btn--small" onClick={() => remove(p.id, p.name)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <Modal
          title={editing.id ? 'Редактировать товар' : 'Новый товар'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="admin-btn admin-btn--secondary" onClick={() => setEditing(null)}>Отмена</button>
              <button className="admin-btn admin-btn--primary" onClick={save}>Сохранить</button>
            </>
          }
        >
          <div className="admin-form">
            <label>Название<input value={editing.name || ''} onChange={(e) => upd('name', e.target.value)} /></label>
            <div className="admin-form-row">
              <label>Цена<input type="number" value={editing.price || ''} onChange={(e) => upd('price', e.target.value)} /></label>
              <label>Старая цена<input type="number" value={editing.oldPrice || ''} onChange={(e) => upd('oldPrice', e.target.value)} /></label>
              <label>Скидка %<input type="number" value={editing.discount || ''} onChange={(e) => upd('discount', e.target.value)} /></label>
            </div>
            <div className="admin-form-row">
              <label>Категория
                <select value={editing.category || ''} onChange={(e) => upd('category', e.target.value)}>
                  <option value="">—</option>
                  {['Смартфоны','Ноутбуки','Телевизоры','Аудиотехника','Планшеты','Умные часы'].map((c) =>
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </label>
              <label>Рейтинг<input type="number" step="0.1" max="5" value={editing.rating || ''} onChange={(e) => upd('rating', e.target.value)} /></label>
              <label>Отзывов<input type="number" value={editing.reviews || ''} onChange={(e) => upd('reviews', e.target.value)} /></label>
            </div>
            <label>Картинка<ImageUpload value={editing.image} onChange={(v) => upd('image', v)} /></label>
            <label>Описание<textarea rows="4" value={editing.description || ''} onChange={(e) => upd('description', e.target.value)} /></label>
            <label>Характеристики<textarea rows="5" value={editing.specifications || ''} onChange={(e) => upd('specifications', e.target.value)} /></label>
          </div>
        </Modal>
      )}

      {ConfirmNode}
    </div>
  );
};

const Orders = ({ toast }) => {
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const { confirm, ConfirmNode } = useConfirm();

  const load = () => api('orders.list', null, 'GET').then((d) => { if (d.success) setItems(d.data); });
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    const ok = await confirm({
      title: 'Удалить заказ?',
      message: `Заказ №${id} будет удалён навсегда. Это действие нельзя отменить.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });
    if (!ok) return;
    const d = await api('orders.delete', { id });
    if (d.success) { toast('✅ ' + d.message); load(); }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Заказы ({items.length})</h2>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>№</th><th>Дата</th><th>Город</th><th>Адрес</th>
            <th>Товаров</th><th>Сумма</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <React.Fragment key={o.id}>
              <tr className="admin-order-row" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                <td>#{o.id}</td>
                <td>{new Date(o.created_at).toLocaleString('ru-RU')}</td>
                <td>{o.city}</td>
                <td>{o.address}</td>
                <td>{o.items_count}</td>
                <td><b>{Number(o.total).toLocaleString('ru-RU')} ₽</b></td>
                <td className="admin-row-actions">
                  <button className="admin-btn admin-btn--danger admin-btn--small"
                          onClick={(e) => { e.stopPropagation(); remove(o.id); }}>🗑️</button>
                </td>
              </tr>
              {expanded === o.id && (
                <tr className="admin-order-details">
                  <td colSpan="7">
                    <h4>Состав заказа</h4>
                    <ul>
                      {o.items.map((it, i) => (
                        <li key={i}>
                          {it.name} — {it.quantity} × {Number(it.price).toLocaleString('ru-RU')} ₽
                          = <b>{(it.quantity * it.price).toLocaleString('ru-RU')} ₽</b>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {items.length === 0 && <div className="admin-empty">Заказов пока нет</div>}
      {ConfirmNode}
    </div>
  );
};

const Users = ({ toast }) => {
  const [items, setItems] = useState([]);
  const { confirm, ConfirmNode } = useConfirm();

  const load = () => api('users.list', null, 'GET').then((d) => { if (d.success) setItems(d.data); });
  useEffect(() => { load(); }, []);

  const changeRole = async (u, role) => {
    const d = await api('users.setRole', { id: u.id, role });
    if (d.success) { toast('✅ ' + d.message); load(); }
  };

  const remove = async (u) => {
    const ok = await confirm({
      title: 'Удалить пользователя?',
      message: `${u.email} будет удалён. Заказы этого пользователя останутся, но привязка потеряется.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });
    if (!ok) return;
    const d = await api('users.delete', { id: u.id });
    if (d.success) { toast('✅ ' + d.message); load(); }
  };

  return (
    <div>
      <div className="admin-toolbar"><h2>Пользователи ({items.length})</h2></div>
      <table className="admin-table">
        <thead>
          <tr><th>ID</th><th>Имя</th><th>Email</th><th>Роль</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="admin-row-actions">
                <button className="admin-btn admin-btn--danger admin-btn--small" onClick={() => remove(u)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {ConfirmNode}
    </div>
  );
};

const Banned = ({ toast }) => {
  const [items, setItems] = useState([]);
  const [word, setWord] = useState('');
  const [search, setSearch] = useState('');
  const { confirm, ConfirmNode } = useConfirm();

  const load = () => api('banned.list', null, 'GET').then((d) => { if (d.success) setItems(d.data); });
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    const d = await api('banned.add', { word: word.trim() });
    if (d.success) { toast('✅ ' + d.message); setWord(''); load(); }
    else toast('❌ ' + d.message);
  };

  const remove = async (id) => {
    const d = await api('banned.delete', { id });
    if (d.success) { toast('✅ ' + d.message); load(); }
  };

  const filtered = items.filter((i) => i.word.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Стоп-слова ({items.length})</h2>
      </div>

      <form className="admin-inline-form" onSubmit={add}>
        <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Новое стоп-слово" />
        <button type="submit" className="admin-btn admin-btn--primary">+ Добавить</button>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Поиск..." />
      </form>

      <div className="banned-grid">
        {filtered.map((b) => (
          <div key={b.id} className="banned-chip">
            <span>{b.word}</span>
            <button onClick={() => remove(b.id)} title="Удалить">×</button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="admin-empty">Ничего не найдено</div>}
      {ConfirmNode}
    </div>
  );
};

const Cities = ({ toast }) => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const { confirm, ConfirmNode } = useConfirm();

  const load = () => api('cities.list', null, 'GET').then((d) => { if (d.success) setItems(d.data); });
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const d = await api('cities.add', { city_name: name.trim() });
    if (d.success) { toast('✅ ' + d.message); setName(''); load(); }
  };

  const remove = async (id, cityName) => {
    const ok = await confirm({
      title: 'Удалить город?',
      message: `«${cityName}» пропадёт из списка городов для доставки.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });
    if (!ok) return;
    const d = await api('cities.delete', { id });
    if (d.success) { toast('✅ ' + d.message); load(); }
  };

  return (
    <div>
      <div className="admin-toolbar"><h2>Города доставки ({items.length})</h2></div>

      <form className="admin-inline-form" onSubmit={add}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название города" />
        <button type="submit" className="admin-btn admin-btn--primary">+ Добавить</button>
      </form>

      <ul className="admin-list">
        {items.map((c) => (
          <li key={c.id}>
            <span>🏙️ {c.city_name}</span>
            <button className="admin-btn admin-btn--danger admin-btn--small" onClick={() => remove(c.id, c.city_name)}>🗑️</button>
          </li>
        ))}
      </ul>
      {ConfirmNode}
    </div>
  );
};
const emptySale = {
  id: 0, name: '', price: '', oldPrice: '', discount: '',
  category: '', rating: 5, reviews: 0, image: '', saleEnds: '',
};

const Sales = ({ toast }) => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const { confirm, ConfirmNode } = useConfirm();

  const load = () => api('sales.list', null, 'GET').then((d) => { if (d.success) setItems(d.data); });
  useEffect(() => { load(); }, []);

  const save = async () => {
    const d = await api('sales.save', editing);
    if (d.success) { toast('✅ ' + d.message); setEditing(null); load(); }
    else toast('❌ ' + d.message);
  };

  const remove = async (id, name) => {
    const ok = await confirm({
      title: 'Удалить акцию?',
      message: `«${name}» пропадёт из раздела «Акции».`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });
    if (!ok) return;
    const d = await api('sales.delete', { id });
    if (d.success) { toast('✅ ' + d.message); load(); }
  };

  const upd = (k, v) => setEditing((p) => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Акции ({items.length})</h2>
        <button className="admin-btn admin-btn--primary" onClick={() => setEditing({ ...emptySale })}>
          + Новая акция
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr><th>ID</th><th>Фото</th><th>Название</th><th>Цена</th><th>Скидка</th><th>До</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.image && <img src={`/assets/images/${s.image}`} alt="" className="admin-thumb" />}</td>
              <td>{s.name}</td>
              <td>{Number(s.price).toLocaleString('ru-RU')} ₽</td>
              <td>{s.discount ? `-${s.discount}%` : '—'}</td>
              <td>{s.saleEnds || '—'}</td>
              <td className="admin-row-actions">
                <button className="admin-btn admin-btn--small" onClick={() => setEditing(s)}>✏️</button>
                <button className="admin-btn admin-btn--danger admin-btn--small" onClick={() => remove(s.id, s.name)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <Modal
          title={editing.id ? 'Редактировать акцию' : 'Новая акция'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="admin-btn admin-btn--secondary" onClick={() => setEditing(null)}>Отмена</button>
              <button className="admin-btn admin-btn--primary" onClick={save}>Сохранить</button>
            </>
          }
        >
          <div className="admin-form">
            <label>Название<input value={editing.name || ''} onChange={(e) => upd('name', e.target.value)} /></label>
            <div className="admin-form-row">
              <label>Цена<input type="number" value={editing.price || ''} onChange={(e) => upd('price', e.target.value)} /></label>
              <label>Старая цена<input type="number" value={editing.oldPrice || ''} onChange={(e) => upd('oldPrice', e.target.value)} /></label>
              <label>Скидка %<input type="number" value={editing.discount || ''} onChange={(e) => upd('discount', e.target.value)} /></label>
            </div>
            <div className="admin-form-row">
              <label>Категория<input value={editing.category || ''} onChange={(e) => upd('category', e.target.value)} /></label>
              <label>Рейтинг<input type="number" step="0.1" value={editing.rating || ''} onChange={(e) => upd('rating', e.target.value)} /></label>
              <label>Отзывов<input type="number" value={editing.reviews || ''} onChange={(e) => upd('reviews', e.target.value)} /></label>
            </div>
            <label>Картинка<ImageUpload value={editing.image} onChange={(v) => upd('image', v)} /></label>
            <label>Акция до<input type="date" value={editing.saleEnds || ''} onChange={(e) => upd('saleEnds', e.target.value)} /></label>
          </div>
        </Modal>
      )}

      {ConfirmNode}
    </div>
  );
};

export default Admin;