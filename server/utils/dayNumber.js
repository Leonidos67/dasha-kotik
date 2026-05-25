import { config } from '../config.js';

const TOTAL_DAYS = 31;

/** Календарная дата Y-M-D в заданном часовом поясе (для Москвы / Сочи). */
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

export function getCurrentDayNumber(now = new Date()) {
  if (config.unlockAllDays) return TOTAL_DAYS;

  const [sy, sm, sd] = config.startDate.split('-').map(Number);
  const start = { y: sy, m: sm, d: sd };
  const today = calendarParts(now, config.timezone);
  const diff = daysBetweenUtc(start, today) + 1;

  if (diff < 1) return 0;
  if (diff > TOTAL_DAYS) return TOTAL_DAYS;
  return diff;
}
