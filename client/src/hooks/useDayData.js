import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';

/** Кэш дней в памяти — повторное открытие без ожидания сети. */
export function useDayData(selectedDay) {
  const cacheRef = useRef({});
  const requestRef = useRef(0);
  const [dayData, setDayData] = useState(null);

  const fetchDay = useCallback(async (n, { silent = false } = {}) => {
    if (!n || n < 1) return;

    const cached = cacheRef.current[n];
    if (cached) {
      setDayData(cached);
      if (silent) return;
    }

    const reqId = ++requestRef.current;

    try {
      const data = await api.getDay(n);
      if (requestRef.current !== reqId) return;
      cacheRef.current[n] = data;
      setDayData(data);
    } catch {
      if (requestRef.current !== reqId) return;
      if (!cached) setDayData(null);
    }
  }, []);

  useEffect(() => {
    if (!selectedDay) return;
    fetchDay(selectedDay);
  }, [selectedDay, fetchDay]);

  const refreshDay = useCallback(() => {
    if (!selectedDay) return;
    delete cacheRef.current[selectedDay];
    return fetchDay(selectedDay);
  }, [selectedDay, fetchDay]);

  return { dayData, refreshDay };
}
