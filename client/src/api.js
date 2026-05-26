import { getAuthToken } from './utils/authToken';

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://dasha-kotik-api.onrender.com' : '')
).replace(/\/$/, '');
const API = `${API_BASE}/api`;

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

function authHeaders(extra = {}, body) {
  const headers = { ...extra };
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    ...options,
    headers: authHeaders(options.headers, options.body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

export const api = {
  me: () => request('/auth/me'),
  loginDasha: (password) =>
    request('/auth/dasha', { method: 'POST', body: JSON.stringify({ password }) }),
  loginTest: (password) =>
    request('/auth/test', { method: 'POST', body: JSON.stringify({ password }) }),
  loginAdmin: (password) =>
    request('/auth/admin', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  meta: () => request('/days/meta'),
  getDay: (n) => request(`/days/${n}`),
  getDays: () => request('/days'),

  submit: (formData) =>
    fetch(`${API}/submissions`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: authHeaders({}, formData),
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      return data;
    }),

  gifts: () => request('/submissions/gifts'),
  markGiftSeen: (dayNumber) =>
    request(`/submissions/gifts/${dayNumber}/seen`, { method: 'POST' }),

  coins: () => request('/coins'),
  redeemDay5CoinGift: () => request('/coins/redeem-day5-gift', { method: 'POST' }),

  adminSubmissions: () => request('/submissions/admin/all'),
  approve: (id, status) =>
    request(`/submissions/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  adminDays: () => request('/admin/days'),
  updateGift: (dayNumber, gift) =>
    request(`/admin/days/${dayNumber}/gift`, {
      method: 'PATCH',
      body: JSON.stringify(gift),
    }),
  updateTask: (dayNumber, taskId, data) =>
    request(`/admin/days/${dayNumber}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  createTask: (dayNumber, data) =>
    request(`/admin/days/${dayNumber}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const TASK_SUBMISSION_TYPES = [
  { value: 'photo', label: 'Фото' },
  { value: 'voice', label: 'Голос' },
  { value: 'text', label: 'Текст' },
  { value: 'workout', label: 'Тренировка (скрин)' },
  { value: 'video', label: 'Видео' },
];
