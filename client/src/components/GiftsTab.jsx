import { useEffect, useState } from 'react';
import { api } from '../api';

export default function GiftsTab({ onUpdate }) {
  const [gifts, setGifts] = useState([]);
  const [open, setOpen] = useState(null);

  const load = () => {
    api.gifts().then((r) => {
      setGifts(r.gifts);
      onUpdate?.();
    });
  };

  useEffect(() => {
    load();
  }, []);

  const openGift = async (gift) => {
    setOpen(gift);
    if (!gift.seen) {
      await api.markGiftSeen(gift.dayNumber);
      load();
    }
  };

  if (gifts.length === 0) {
    return (
      <div className="waiting-day">
        <div className="big">🎁</div>
        <p>Пока нет открытых подарков.</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Выполни задания — Лёня проверит — и подарок появится здесь.
        </p>
      </div>
    );
  }

  return (
    <>
      {gifts.map((g) => (
        <div
          key={g.dayNumber}
          className={`gift-card ${!g.seen ? 'new' : ''}`}
          onClick={() => openGift(g)}
          onKeyDown={(e) => e.key === 'Enter' && openGift(g)}
          role="button"
          tabIndex={0}
        >
          <h3>
            День {g.dayNumber}
            {!g.seen && ' · НОВЫЙ'}
          </h3>
          <p>{g.gift.title}</p>
        </div>
      ))}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🎁 Подарок за день {open.dayNumber}</h2>
            <h3 style={{ color: 'var(--gold)', marginTop: '0.5rem' }}>{open.gift.title}</h3>
            <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>{open.gift.description}</p>
            {open.isFinale && (
              <p style={{ marginTop: '1rem', color: 'var(--accent-soft)' }}>
                Зай, ты прошла весь месяц. Я тебя люблю. 💋
              </p>
            )}
            <button type="button" className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setOpen(null)}>
              Обнять Лёню мысленно
            </button>
          </div>
        </div>
      )}
    </>
  );
}
