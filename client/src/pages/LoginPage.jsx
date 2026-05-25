import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BannerMascot from '../components/BannerMascot';
import { PLAYER_NAME, PLAYER_ROLE } from '../constants';

export default function LoginPage() {
  const { loginDashenka, loginAdmin } = useAuth();
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState(PLAYER_ROLE);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === PLAYER_ROLE) await loginDashenka(password);
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

        <div className="tabs" style={{ maxWidth: 320, marginTop: '1rem' }}>
          <button
            type="button"
            className={mode === PLAYER_ROLE ? 'active' : ''}
            onClick={() => setMode(PLAYER_ROLE)}
          >
            {PLAYER_NAME}
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
