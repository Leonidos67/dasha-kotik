import { useEffect, useState } from 'react';
import './HugOverlay.css';

const DURATION_MS = 3000;
const TICK_MS = 1000;

export default function HugOverlay({ onComplete }) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setDots(1), TICK_MS),
      setTimeout(() => setDots(2), TICK_MS * 2),
      setTimeout(() => setDots(3), TICK_MS * 3),
      setTimeout(() => onComplete(), DURATION_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const text = `обнимаю${'.'.repeat(dots)}`;

  return (
    <div className="hug-overlay" role="dialog" aria-live="polite" aria-label="Обнимашки">
      <p className="hug-overlay__text">{text}</p>
    </div>
  );
}
