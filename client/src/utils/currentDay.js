const TOTAL_DAYS = 31;

function calendarParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

function daysBetweenUtc(a, b) {
  const t1 = Date.UTC(a.y, a.m - 1, a.d);
  const t2 = Date.UTC(b.y, b.m - 1, b.d);
  return Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));
}

/** Тот же расчёт, что на сервере — подстраховка для телефона / старого кэша API */
export function getClientCurrentDay(startDate, timezone = 'Europe/Moscow', now = new Date()) {
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const diff = daysBetweenUtc({ y: sy, m: sm, d: sd }, calendarParts(now, timezone)) + 1;
  if (diff < 1) return 0;
  if (diff > TOTAL_DAYS) return TOTAL_DAYS;
  return diff;
}

export function resolveAppDay(meta) {
  if (!meta) return { currentDay: 0, selectedDay: null };

  if (meta.unlockAllDays) {
    const currentDay = meta.currentDay > 0 ? meta.currentDay : TOTAL_DAYS;
    return { currentDay, selectedDay: 1 };
  }

  let currentDay = Number(meta.currentDay) || 0;
  const tz = meta.timezone || 'Europe/Moscow';

  if (currentDay === 0 && meta.startDate) {
    const clientDay = getClientCurrentDay(meta.startDate, tz);
    if (clientDay > 0) currentDay = clientDay;
  }

  const selectedDay = currentDay > 0 ? currentDay : null;
  return { currentDay, selectedDay };
}
