import { useCallback, useEffect, useMemo, useState } from 'react';
import { hasSeenDayIntro, markDayIntroSeen } from '../utils/dayIntro';

function dayMatches(dayData, selectedDay) {
  if (!dayData || selectedDay == null) return false;
  return Number(dayData.dayNumber) === Number(selectedDay);
}

export function useDayReveal(selectedDay, dayData) {
  const [revealUnlocked, setRevealUnlocked] = useState(false);

  useEffect(() => {
    setRevealUnlocked(false);
  }, [selectedDay]);

  const completeReveal = useCallback(() => {
    markDayIntroSeen(selectedDay);
    setRevealUnlocked(true);
  }, [selectedDay]);

  const phase = useMemo(() => {
    if (!dayMatches(dayData, selectedDay)) return 'loading';

    const allApproved =
      dayData.tasks?.length > 0 &&
      dayData.tasks.every((t) => t.submission?.status === 'approved');

    if (allApproved || hasSeenDayIntro(selectedDay) || revealUnlocked) {
      return 'ready';
    }

    return 'reveal';
  }, [selectedDay, dayData, revealUnlocked]);

  return { phase, completeReveal };
}
