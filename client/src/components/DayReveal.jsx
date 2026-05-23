import { useEffect, useRef, useState } from 'react';
import BannerMascot from './BannerMascot';
import staticVideo from '../static.mp4';
import './DayReveal.css';

const DURATION_MS = 2400;

const MESSAGES = [
  'Сегодня — только для тебя',
  'Лёня приготовил задания',
  'Готова, зай?',
];

function ringFill(progress, from, to) {
  if (progress <= from) return 0;
  if (progress >= to) return 1;
  return (progress - from) / (to - from);
}

function Ring({ radius, stroke, progress, color, from, to }) {
  const c = 2 * Math.PI * radius;
  const filled = c * ringFill(progress, from, to);

  return (
    <circle
      cx="60"
      cy="60"
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeDasharray={c}
      strokeDashoffset={c - filled}
      transform="rotate(-90 60 60)"
    />
  );
}

export default function DayReveal({ dayNumber, title, isBonus, isFinale, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onCompleteRef.current();
  };

  useEffect(() => {
    finishedRef.current = false;
    setProgress(0);
    setMsgIndex(0);

    const start = performance.now();
    let raf;

    const tick = (now) => {
      const p = Math.min(1, (now - start) / DURATION_MS);
      setProgress(p);
      setMsgIndex(Math.min(MESSAGES.length - 1, Math.floor(p * MESSAGES.length)));

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(finish, 350);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dayNumber]);

  const subtitle = isFinale
    ? 'Финал в Сочи'
    : isBonus
      ? 'Бонусный день'
      : title || `День ${dayNumber}`;

  return (
    <section className="day-reveal" aria-live="polite">
      <div className="day-reveal__glow" aria-hidden />

      <div className="day-reveal__ring-wrap">
        <svg className="day-reveal__svg" viewBox="0 0 120 120" aria-hidden>
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
          <Ring radius={52} stroke={6} progress={progress} color="rgba(255,107,157,0.35)" from={0} to={1} />
          <Ring radius={44} stroke={5} progress={progress} color="#ff6b9d" from={0.12} to={1} />
          <Ring radius={36} stroke={4} progress={progress} color="#ffd166" from={0.28} to={1} />
        </svg>
        <div className="day-reveal__center">
          <span className="day-reveal__day">{dayNumber}</span>
          <span className="day-reveal__sub">{subtitle}</span>
        </div>
      </div>

      <p className="day-reveal__msg">{MESSAGES[msgIndex]}</p>

      <BannerMascot variant="embedded" src={staticVideo} />
    </section>
  );
}
