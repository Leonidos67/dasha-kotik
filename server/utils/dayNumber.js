import { config } from '../config.js';

const TOTAL_DAYS = 31;

export function getCurrentDayNumber(now = new Date()) {
  if (config.unlockAllDays) return TOTAL_DAYS;

  const start = new Date(config.startDate + 'T00:00:00');
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diff = Math.floor((today - startDay) / (1000 * 60 * 60 * 24)) + 1;

  if (diff < 1) return 0;
  if (diff > TOTAL_DAYS) return TOTAL_DAYS;
  return diff;
}
