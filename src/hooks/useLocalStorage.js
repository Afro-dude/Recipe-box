import { useEffect, useState } from "react";

/**
 * useState that survives a page reload.
 * Reads once on mount (lazy initialiser), writes on every change.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : initialValue;
      return Array.isArray(initialValue) && !Array.isArray(parsed) ? initialValue : parsed;
    } catch {
      // Corrupt JSON or storage disabled (private mode) — fall back to default.
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage unavailable — the app still works in memory.
    }
  }, [key, value]);

  return [value, setValue];
}
