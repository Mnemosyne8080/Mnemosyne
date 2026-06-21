import { useEffect, useRef, useState } from 'react';

export function useDebouncedSave<T>(value: T, saveFn: (val: T) => Promise<void>, delay = 500) {
  const [isSaved, setIsSaved] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await saveFn(value);
      } catch {
        // silently fail
      }
      setIsSaved(true);
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay, saveFn]);

  return { isSaved };
}
