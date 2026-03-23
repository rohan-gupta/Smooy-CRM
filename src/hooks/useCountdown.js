import { useState, useEffect } from 'react';

export function useCountdown(startSeconds = 60) {
  const [seconds, setSeconds] = useState(startSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const reset = () => setSeconds(startSeconds);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const formatted = seconds > 0 ? `${mm}:${ss}` : null;

  return { seconds, formatted, reset };
}
