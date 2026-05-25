import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useDayData } from '../hooks/useDayData';
import { resolveAppDay } from '../utils/currentDay';
import SubmitModal from '../components/SubmitModal';
import GiftsTab from '../components/GiftsTab';
import CoinsTab from '../components/CoinsTab';
import DayPicker from '../components/DayPicker';
import DayTasks from '../components/DayTasks';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

export default function DashaApp() {
  const { logout, playerName } = useAuth();
  const [tab, setTab] = useState('today');
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [submitTask, setSubmitTask] = useState(null);
  const [unseenGifts, setUnseenGifts] = useState(0);
  const [coinsBalance, setCoinsBalance] = useState(null);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState('');

  const { dayData, refreshDay } = useDayData(selectedDay);
  const [daysProgress, setDaysProgress] = useState({});

  const loadDaysProgress = useCallback(async () => {
    const { days } = await api.getDays();
    const map = {};
    for (const d of days) {
      map[d.dayNumber] = d.giftStatus;
    }
    setDaysProgress(map);
  }, []);

  const loadGiftsBadge = useCallback(async () => {
    const { gifts, coinsBalance: balance } = await api.gifts();
    setUnseenGifts(gifts.filter((g) => !g.seen).length);
    setCoinsBalance(balance);
  }, []);

  const applyMeta = useCallback((meta) => {
    const { currentDay: day, selectedDay: selected } = resolveAppDay(meta);
    setCurrentDay(day);
    setSelectedDay(selected);
    setBootError('');
  }, []);

  const loadMeta = useCallback(
    async (opts = {}) => {
      const { silent = false } = opts;
      if (!silent) setBooting(true);
      setBootError('');

      try {
        const meta = await api.meta();
        applyMeta(meta);
        if (!silent) {
          await Promise.all([loadGiftsBadge(), loadDaysProgress()]);
        }
      } catch (err) {
        setBootError(err.message || 'Не удалось загрузить день');
      } finally {
        if (!silent) setBooting(false);
      }
    },
    [applyMeta, loadGiftsBadge, loadDaysProgress]
  );

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadMeta({ silent: true });
      }
    };

    const onPageShow = (e) => {
      if (e.persisted) loadMeta({ silent: true });
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [loadMeta]);

  useEffect(() => {
    if (dayData?.giftStatus && selectedDay) {
      setDaysProgress((prev) => ({ ...prev, [selectedDay]: dayData.giftStatus }));
    }
  }, [dayData?.giftStatus, selectedDay]);

  const refresh = () => {
    refreshDay();
    loadGiftsBadge();
    loadDaysProgress();
  };

  if (booting) {
    return (
      <div className="app-shell">
        <div className="day-tasks-loading" style={{ minHeight: '40vh' }} aria-busy="true">
          <span className="day-tasks-loading__dot" />
          <span className="day-tasks-loading__dot" />
          <span className="day-tasks-loading__dot" />
        </div>
      </div>
    );
  }

  if (bootError) {
    return (
      <div className="app-shell">
        <div className="waiting-day">
          <p className="error">{bootError}</p>
          <button type="button" className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => loadMeta()}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  if (currentDay === 0) {
    return (
      <div className="app-shell">
        <div className="waiting-day">
          <div className="big">⏳</div>
          <h2>Скоро все начнётся коть)</h2>
          <p>Первый день — 25 мая 2026. Зай, чуть-чуть подожди. пжпжпж</p>
          <button type="button" className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => loadMeta()}>
            Обновить
          </button>
          <button type="button" className="btn-secondary" style={{ marginTop: '0.5rem' }} onClick={logout}>
            Слушаюсь Зай! Выйти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="header">
        <h1>Привет, {playerName} 🐰</h1>
        <p>
          {tab === 'today' && dayData?.date
            ? formatDate(dayData.date)
            : selectedDay
              ? `День ${selectedDay} из 31`
              : '…'}
        </p>
      </header>

      <nav className="tabs tabs--three">
        <button type="button" className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}>
          Задания
        </button>
        <button type="button" className={tab === 'coins' ? 'active' : ''} onClick={() => setTab('coins')}>
          Мои монетки
          {coinsBalance != null && <span className="tab-coins">{coinsBalance}🪙</span>}
        </button>
        <button type="button" className={tab === 'gifts' ? 'active' : ''} onClick={() => setTab('gifts')}>
          Подарки
          {unseenGifts > 0 && <span className="badge">{unseenGifts}</span>}
        </button>
      </nav>

      {tab === 'gifts' ? (
        <GiftsTab onUpdate={loadGiftsBadge} />
      ) : tab === 'coins' ? (
        <CoinsTab />
      ) : (
        selectedDay && (
          <>
            <DayPicker
              currentDay={currentDay}
              selectedDay={selectedDay}
              daysProgress={daysProgress}
              onSelect={setSelectedDay}
            />
            <DayTasks dayData={dayData} selectedDay={selectedDay} onSubmit={setSubmitTask} />
          </>
        )
      )}

      <button
        type="button"
        className="btn-secondary"
        style={{ display: 'block', margin: '2rem auto 0' }}
        onClick={logout}
      >
        Выйти
      </button>

      {submitTask && (
        <SubmitModal
          task={submitTask}
          dayNumber={selectedDay}
          onClose={() => setSubmitTask(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
