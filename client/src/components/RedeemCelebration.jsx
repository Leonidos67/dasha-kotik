import { useEffect } from 'react';
import './RedeemCelebration.css';

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 17) % 84}%`,
  delay: `${(i % 8) * 0.08}s`,
  emoji: ['🪙', '✨', '💕', '🎁'][i % 4],
}));

export default function RedeemCelebration({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="redeem-celebration" aria-hidden>
      <div className="redeem-celebration__glow" />
      <p className="redeem-celebration__title">Подарок твой!</p>
      <p className="redeem-celebration__sub">Монетки превратились в чудо</p>
      <div className="redeem-celebration__particles">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="redeem-celebration__particle"
            style={{ left: p.left, animationDelay: p.delay }}
          >
            {p.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
