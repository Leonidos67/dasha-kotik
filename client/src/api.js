const API = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

export const api = {
  me: () => request('/auth/me'),
  loginDasha: (password) =>
    request('/auth/dasha', { method: 'POST', body: JSON.stringify({ password }) }),
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
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      return data;
    }),

  gifts: () => request('/submissions/gifts'),
  markGiftSeen: (dayNumber) =>
    request(`/submissions/gifts/${dayNumber}/seen`, { method: 'POST' }),

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
};
