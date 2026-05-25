import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashaApp from './pages/DashaApp';
import { PLAYER_ROLES } from './constants';
import AdminApp from './pages/AdminApp';

function Protected({ roles, children }) {
  const { role: userRole, loading } = useAuth();
  if (loading) return <div className="login-page">Загрузка…</div>;
  if (!roles.includes(userRole)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { role, loading } = useAuth();

  if (loading) {
    return <div className="login-page">Загрузка…</div>;
  }

  const isPlayer = PLAYER_ROLES.includes(role);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isPlayer ? (
            <Navigate to="/app" replace />
          ) : role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/app/*"
        element={
          <Protected roles={PLAYER_ROLES}>
            <DashaApp />
          </Protected>
        }
      />
      <Route
        path="/admin/*"
        element={
          <Protected roles={['admin']}>
            <AdminApp />
          </Protected>
        }
      />
    </Routes>
  );
}
