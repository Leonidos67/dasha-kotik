const STORAGE_KEY = 'dasha-moscow-intro-days';

function readSet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(
      (Array.isArray(arr) ? arr : []).map((n) => Number(n)).filter((n) => !Number.isNaN(n))
    );
  } catch {
    return new Set();
  }
}

function writeSet(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Показывали ли уже заставку для этого номера дня (навсегда в этом браузере). */
export function hasSeenDayIntro(dayNumber) {
  return readSet().has(Number(dayNumber));
}

/** Отметить день после показа заставки. */
export function markDayIntroSeen(dayNumber) {
  const set = readSet();
  set.add(Number(dayNumber));
  writeSet(set);
}
