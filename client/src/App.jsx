import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashaApp from './pages/DashaApp';
import AdminApp from './pages/AdminApp';

function Protected({ role, children }) {
  const { role: userRole, loading } = useAuth();
  if (loading) return <div className="login-page">Загрузка…</div>;
  if (userRole !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { role, loading } = useAuth();

  if (loading) {
    return <div className="login-page">Загрузка…</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          role === 'dasha' ? (
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
          <Protected role="dasha">
            <DashaApp />
          </Protected>
        }
      />
      <Route
        path="/admin/*"
        element={
          <Protected role="admin">
            <AdminApp />
          </Protected>
        }
      />
      </Routes>
  );
}
