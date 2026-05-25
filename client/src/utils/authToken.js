const STORAGE_KEY = 'dasha-moscow-token';

export function getAuthToken() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode */
  }
}

export function clearAuthToken() {
  setAuthToken(null);
}
