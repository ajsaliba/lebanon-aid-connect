import { useCallback, useState } from 'react';

export function usePersistedState<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setRaw] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : fallback;
    } catch {
      return fallback;
    }
  });

  const setValue = useCallback((v: T | ((prev: T) => T)) => {
    setRaw(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Ignore storage exceptions.
      }
      return next;
    });
  }, [key]);

  return [value, setValue];
}
