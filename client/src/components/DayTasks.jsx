import { useEffect, useState } from 'react';
import { useDayReveal } from '../hooks/useDayReveal';
import DayReveal from './DayReveal';
import TaskCard from './TaskCard';

const LOADER_DELAY_MS = 180;

export default function DayTasks({ dayData, selectedDay, onSubmit }) {
  const { phase, completeReveal } = useDayReveal(selectedDay, dayData);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (phase !== 'loading') {
      setShowLoader(false);
      return;
    }
    const t = setTimeout(() => setShowLoader(true), LOADER_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, selectedDay]);

  if (phase === 'loading' && showLoader) {
    return (
      <div className="day-tasks-loading" aria-busy="true">
        <span className="day-tasks-loading__dot" />
        <span className="day-tasks-loading__dot" />
        <span className="day-tasks-loading__dot" />
      </div>
    );
  }

  if (phase === 'loading') {
    return <div className="day-tasks-loading day-tasks-loading--hidden" aria-hidden />;
  }

  if (phase === 'reveal') {
    return (
      <DayReveal
        dayNumber={selectedDay}
        title={dayData.title}
        isBonus={dayData.isBonus}
        isFinale={dayData.isFinale}
        onComplete={completeReveal}
      />
    );
  }

  return (
    <div className="day-tasks-ready">
      <p
        className={[
          'day-label',
          dayData.isBonus ? 'bonus' : '',
          dayData.isFinale ? 'finale' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {dayData.title || `День ${dayData.dayNumber}`}
        {dayData.isBonus && ' — бонусный день'}
        {dayData.isFinale && ' — ты в Сочи!'}
      </p>

      <ul className="task-list">
        {dayData.tasks?.map((task, i) => (
          <li key={task._id}>
            <TaskCard task={task} index={i} onSubmit={onSubmit} />
          </li>
        ))}
      </ul>
    </div>
  );
}
