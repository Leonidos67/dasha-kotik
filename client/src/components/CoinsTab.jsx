import { useEffect, useState } from 'react';
import { api } from '../api';
import './CoinsTab.css';

export default function CoinsTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    api
      .coins()
      .then(setData)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!data) {
    return (
      <div className="day-tasks-loading" aria-busy="true">
        <span className="day-tasks-loading__dot" />
        <span className="day-tasks-loading__dot" />
        <span className="day-tasks-loading__dot" />
      </div>
    );
  }

  return (
    <div className="coins-tab">
      <div className="coins-balance">
        <span className="coins-balance__icon" aria-hidden>
          🪙
        </span>
        <div>
          <p className="coins-balance__label">Твои монетки</p>
          <p className="coins-balance__value">
            {data.balance} <span className="coins-balance__of">/ {data.maxEarn}</span>
          </p>
        </div>
      </div>

      <p className="coins-hint">
        За каждое задание, которое Лёня одобрил в днях 1–5, — одна монетка. Всего можно собрать{' '}
        {data.maxEarn}.
      </p>

      <ul className="coins-days">
        {data.breakdown.map((d) => (
          <li key={d.dayNumber} className="coins-day-row">
            <span>День {d.dayNumber}</span>
            <span className="coins-day-row__count">
              {d.approvedCount} / {d.taskCount} → {d.coins} 🪙
            </span>
          </li>
        ))}
      </ul>

      {data.day5CoinGift.redeemed && (
        <p className="coins-redeemed-note">Подарок за 10 монет (день 5) уже получен — смотри во вкладке «Подарки».</p>
      )}
    </div>
  );
}
