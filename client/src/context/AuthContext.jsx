import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((r) => setRole(r.role))
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, []);

  const loginDasha = async (password) => {
    const r = await api.loginDasha(password);
    setRole(r.role);
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
    <AuthContext.Provider value={{ role, loading, loginDasha, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
