import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { api, getToken, clearToken, setToken, getStoredUser, setStoredUser, clearStoredUser } from './lib/api.js';
import { rt } from './lib/ws.js';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('nexa_theme') || 'dark');
  const [page, setPage] = useState('home'); // home | chat | projects | files | team | settings
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeChannel, setActiveChannel] = useState('global');
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(new Map());

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('nexa_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  const toast = useCallback((msg, kind = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // Session boot: validate token
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getToken();
      if (token) {
        try {
          const me = await api.get('/api/auth/me');
          if (!cancelled) setUser(me.user);
        } catch {
          clearToken(); clearStoredUser(); setUser(null);
        }
      }
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Connect WS after auth
  useEffect(() => {
    if (!user) return;
    rt.connect();
    const off1 = rt.on('auth:ok', () => { rt.subscribe('global'); });
    const off2 = rt.on('notification', (ev) => {
      const n = { id: ev.notification.id, kind: ev.notification.type, title: ev.notification.title, body: ev.notification.body, createdAt: ev.notification.createdAt, read: false };
      setNotifications(ns => [n, ...ns].slice(0, 100));
      setUnreadCount(c => c + 1);
      toast(n.title, 'info');
    });
    const off3 = rt.on('presence', (ev) => {
      setOnlineUsers(m => {
        const n = new Map(m);
        if (ev.online) n.set(ev.userId, ev.user); else n.delete(ev.userId);
        return n;
      });
    });
    const off4 = rt.on('presence:roster', (ev) => {
      const m = new Map();
      for (const u of ev.users) m.set(u.id, u);
      setOnlineUsers(m);
    });
    const off5 = rt.on('user:join', (ev) => toast(`${ev.user.name} joined the team`, 'success'));
    const off6 = rt.on('file:new', (ev) => toast(`${ev.uploader.name} uploaded ${ev.file.name}`, 'info'));
    const off7 = rt.on('project:create', () => toast('New project created', 'success'));
    return () => { off1(); off2(); off3(); off4(); off5(); off6(); off7(); };
  }, [user, toast]);

  // Fetch notifications on auth
  useEffect(() => {
    if (!user) return;
    api.get('/api/notifications').then(n => {
      setNotifications(n.notifications.map(x => ({ ...x, read: !!x.readAt, kind: x.type, title: x.payload.title || x.type, body: x.payload.body || '' })));
      setUnreadCount(n.notifications.filter(x => !x.readAt).length);
    }).catch(()=>{});
  }, [user]);

  const login = async (email, password) => {
    const r = await api.post('/api/auth/login', { email, password });
    setToken(r.token); setStoredUser(r.user); setUser(r.user);
  };
  const register = async (email, name, password) => {
    const r = await api.post('/api/auth/register', { email, name, password });
    setToken(r.token); setStoredUser(r.user); setUser(r.user);
  };
  const logout = () => {
    clearToken(); clearStoredUser(); setUser(null);
    rt.close();
    setPage('home'); setActiveChannel('global'); setActiveProjectId(null);
  };

  const markAllRead = async () => {
    await api.post('/api/notifications/read-all', {});
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const ctx = {
    user, login, register, logout, ready,
    theme, toggleTheme,
    page, setPage,
    activeProjectId, setActiveProjectId,
    activeChannel, setActiveChannel,
    toasts, toast,
    notifications, setNotifications, unreadCount, setUnreadCount, markAllRead,
    onlineUsers, rt
  };

  if (!ready) {
    return <div className="h-full flex items-center justify-center text-muted">Loading Nexa…</div>;
  }

  return (
    <AppCtx.Provider value={ctx}>
      {!user ? <Login /> : <Dashboard />}
      <ToastContainer toasts={toasts} />
    </AppCtx.Provider>
  );
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`pointer-events-auto animate-fade-in card px-4 py-3 text-sm max-w-sm
          ${t.kind === 'error' ? 'border-danger/40' : t.kind === 'success' ? 'border-success/40' : ''}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
