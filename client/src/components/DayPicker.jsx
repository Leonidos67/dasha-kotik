import { useEffect, useRef } from 'react';
import Grainient from './Grainient';
import './Grainient.css';
import './DayPicker.css';

const BONUS_DAYS = new Set([10, 20, 30]);

const GRAINIENT_PROPS = {
  color1: '#ff7ba8',
  color2: '#ff6b9d',
  color3: '#ffb3d0',
  timeSpeed: 1.2,
  colorBalance: 0,
  warpStrength: 1,
  warpFrequency: 5,
  warpSpeed: 2,
  warpAmplitude: 50,
  blendAngle: 0,
  blendSoftness: 0.05,
  rotationAmount: 500,
  noiseScale: 2,
  grainAmount: 0.1,
  grainScale: 2,
  grainAnimated: false,
  contrast: 1.5,
  gamma: 1,
  saturation: 1,
  centerX: 0,
  centerY: 0,
  zoom: 0.9,
};

export default function DayPicker({ currentDay, selectedDay, daysProgress = {}, onSelect }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedDay]);

  return (
    <section className="path-panel" aria-label="Выбор дня">
      <div className="path-panel__bg" aria-hidden>
        <Grainient {...GRAINIENT_PROPS} />
        <div className="path-panel__veil" />
      </div>

      <div className="path-panel__content">
        <div className="path-panel__header">
          <span className="path-panel__title">Твой путь</span>
          <span className="path-panel__badge">
            {currentDay} / 31
          </span>
        </div>

        <div className="path-scroll">
          <div className="path-track">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => {
              const locked = n > currentDay;
              const active = selectedDay === n;
              const bonus = BONUS_DAYS.has(n);
              const finale = n === 31;
              const completed =
                daysProgress[n]?.allApproved || daysProgress[n]?.allSubmitted;

              return (
                <button
                  key={n}
                  ref={active ? activeRef : undefined}
                  type="button"
                  className={[
                    'path-day',
                    active && 'path-day--active',
                    locked && 'path-day--locked',
                    bonus && 'path-day--bonus',
                    finale && 'path-day--finale',
                    completed && !locked && 'path-day--completed',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelect(n)}
                  disabled={locked}
                  aria-label={`День ${n}${completed ? ', выполнен' : ''}${bonus ? ', бонус' : ''}${finale ? ', финал' : ''}`}
                  aria-current={active ? 'true' : undefined}
                >
                  {bonus && !locked && <span className="path-day__star" aria-hidden>★</span>}
                  {finale && !locked && <span className="path-day__heart" aria-hidden>♥</span>}
                  {locked ? (
                    <span className="path-day__icon">🔒</span>
                  ) : (
                    <>
                      <span className="path-day__num">{n}</span>
                      {completed && !active && (
                        <span className="path-day__check" aria-hidden>
                          ✓
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
