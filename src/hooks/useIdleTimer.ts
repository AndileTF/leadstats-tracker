import { useEffect, useRef, useState } from 'react';

interface UseIdleTimerProps {
  timeout: number; // in milliseconds
  onIdle: () => void;
  onActive?: () => void;
  events?: string[];
}

export const useIdleTimer = ({
  timeout,
  onIdle,
  onActive,
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
}: UseIdleTimerProps) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    lastActivityRef.current = Date.now();

    if (isIdle) {
      setIsIdle(false);
      onActive?.();
    }

    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, timeout);
  };

  const handleActivity = () => {
    resetTimer();
  };

  useEffect(() => {
    // Set up event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the timer
    resetTimer();

    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeout, onIdle, onActive]);

  const getLastActivity = () => lastActivityRef.current;
  const getRemainingTime = () => {
    const elapsed = Date.now() - lastActivityRef.current;
    return Math.max(0, timeout - elapsed);
  };

  return {
    isIdle,
    lastActivity: getLastActivity(),
    remainingTime: getRemainingTime(),
    reset: resetTimer
  };
};