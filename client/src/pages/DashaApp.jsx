import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useDayData } from '../hooks/useDayData';
import SubmitModal from '../components/SubmitModal';
import GiftsTab from '../components/GiftsTab';
import DayPicker from '../components/DayPicker';
import DayTasks from '../components/DayTasks';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

export default function DashaApp() {
  const { logout } = useAuth();
  const [tab, setTab] = useState('today');
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [submitTask, setSubmitTask] = useState(null);
  const [unseenGifts, setUnseenGifts] = useState(0);
  const [booting, setBooting] = useState(true);

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
    const { gifts } = await api.gifts();
    setUnseenGifts(gifts.filter((g) => !g.seen).length);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const meta = await api.meta();
        if (cancelled) return;

        setCurrentDay(meta.currentDay);
        const day = meta.currentDay > 0 ? (meta.unlockAllDays ? 1 : meta.currentDay) : null;
        setSelectedDay(day);
        await Promise.all([loadGiftsBadge(), loadDaysProgress()]);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadGiftsBadge, loadDaysProgress]);

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

  if (currentDay === 0) {
    return (
      <div className="app-shell">
        <div className="waiting-day">
          <div className="big">⏳</div>
          <h2>Скоро все начнётся коть)</h2>
          <p>Первый день — 25 мая 2026. Зай, чуть-чуть подожди. пжпжпж</p>
          <button type="button" className="btn-secondary" style={{ marginTop: '1rem' }} onClick={logout}>
            Слушаюсь Зай! Выйти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="header">
        <h1>Привет, зай 🐰</h1>
        <p>
          {tab === 'today' && dayData?.date
            ? formatDate(dayData.date)
            : selectedDay
              ? `День ${selectedDay} из 31`
              : '…'}
        </p>
      </header>

      <nav className="tabs">
        <button type="button" className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}>
          Задания
        </button>
        <button type="button" className={tab === 'gifts' ? 'active' : ''} onClick={() => setTab('gifts')}>
          Подарки
          {unseenGifts > 0 && <span className="badge">{unseenGifts}</span>}
        </button>
      </nav>

      {tab === 'gifts' ? (
        <GiftsTab onUpdate={loadGiftsBadge} />
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
