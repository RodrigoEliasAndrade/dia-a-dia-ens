import { useState, useEffect, useCallback } from 'react';

type Validator<T> = (value: unknown) => value is T;

interface UseLocalStorageOptions<T> {
  /** Optional type guard to validate parsed data. If validation fails, returns initialValue. */
  validate?: Validator<T>;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void] {
  const { validate } = options;

  const read = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed = JSON.parse(item);
      if (validate && !validate(parsed)) {
        console.warn(`[useLocalStorage] Invalid shape at "${key}", using default`);
        return initialValue;
      }
      return parsed;
    } catch {
      return initialValue;
    }
  }, [key, initialValue, validate]);

  const [storedValue, setStoredValue] = useState<T>(read);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch {
          console.warn(`Failed to save to localStorage key "${key}"`);
        }
        return valueToStore;
      });
    },
    [key],
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (validate && !validate(parsed)) return;
        setStoredValue(parsed);
      } catch {
        /* ignore parse errors */
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, validate]);

  return [storedValue, setValue];
}
