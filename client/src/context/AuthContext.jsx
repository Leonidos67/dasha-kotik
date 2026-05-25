import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';
import { PLAYER_NAME, PLAYER_ROLE, TEST_NAME, TEST_ROLE } from '../constants';
import { clearAuthToken, setAuthToken } from '../utils/authToken';

const AuthContext = createContext(null);

function normalizeRole(role) {
  if (role === 'dashenka') return TEST_ROLE;
  return role;
}

function nameForRole(role) {
  if (role === TEST_ROLE) return TEST_NAME;
  if (role === PLAYER_ROLE) return PLAYER_NAME;
  return '';
}

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [playerName, setPlayerName] = useState(PLAYER_NAME);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(() => {
    return api
      .me()
      .then((r) => {
        const nextRole = normalizeRole(r.role);
        setRole(nextRole);
        setPlayerName(r.name || nameForRole(nextRole) || PLAYER_NAME);
        return nextRole;
      })
      .catch(() => {
        clearAuthToken();
        setRole(null);
        return null;
      });
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshSession();
    };
    const onPageShow = (e) => {
      if (e.persisted) refreshSession();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [refreshSession]);

  const applyLogin = (r) => {
    if (r.token) setAuthToken(r.token);
    const nextRole = normalizeRole(r.role);
    setRole(nextRole);
    setPlayerName(r.name || nameForRole(nextRole));
  };

  const loginDasha = async (password) => {
    applyLogin(await api.loginDasha(password));
  };

  const loginTest = async (password) => {
    applyLogin(await api.loginTest(password));
  };

  const loginAdmin = async (password) => {
    const r = await api.loginAdmin(password);
    if (r.token) setAuthToken(r.token);
    setRole(r.role);
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      clearAuthToken();
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ role, playerName, loading, loginDasha, loginTest, loginAdmin, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
