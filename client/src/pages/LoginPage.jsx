import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BannerMascot from '../components/BannerMascot';

export default function LoginPage() {
  const { loginDasha, loginAdmin } = useAuth();
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('dasha');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'dasha') await loginDasha(password);
      else await loginAdmin(password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <BannerMascot variant="fixed" />
      <div className="login-page">
      <h1>Зайка 💕</h1>
      {/* <p>31 день - Москва и обратно в Сочи</p> */}

      <div className="tabs" style={{ maxWidth: 320, marginTop: '1rem' }}>
        <button type="button" className={mode === 'dasha' ? 'active' : ''} onClick={() => setMode('dasha')}>
          Даша
        </button>
        <button type="button" className={mode === 'admin' ? 'active' : ''} onClick={() => setMode('admin')}>
          Лёня
        </button>
      </div>

      <form onSubmit={submit}>
        {error && <p className="error">{error}</p>}
        <input
          type="password"
          placeholder="Парольчик пжпжпж"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit" className="btn-primary">
          Войти - нет. Залететь - да!
        </button>
      </form>
    </div>
    </>
  );
}
