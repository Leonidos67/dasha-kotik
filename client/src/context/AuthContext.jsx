import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';
import { PLAYER_NAME, PLAYER_ROLE } from '../constants';

const AuthContext = createContext(null);

function normalizeRole(role) {
  if (role === 'dasha') return PLAYER_ROLE;
  return role;
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
        if (r.name) setPlayerName(r.name);
        return nextRole;
      })
      .catch(() => {
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

  const loginDashenka = async (password) => {
    const r = await api.loginDashenka(password);
    setRole(normalizeRole(r.role));
    if (r.name) setPlayerName(r.name);
  };

  const loginAdmin = async (password) => {
    const r = await api.loginAdmin(password);
    setRole(r.role);
  };

  const logout = async () => {
    await api.logout();
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ role, playerName, loading, loginDashenka, loginAdmin, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
