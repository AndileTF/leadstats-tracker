import { useEffect, useState, useCallback, useRef } from 'react';

interface UseIdleTimerOptions {
  timeout: number; // in milliseconds
  warningTime: number; // time before timeout to show warning (in milliseconds)
  onIdle: () => void;
  onActive?: () => void;
}

export const useIdleTimer = ({
  timeout,
  warningTime,
  onIdle,
  onActive,
}: UseIdleTimerOptions) => {
  const [isIdle, setIsIdle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeout);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    setShowWarning(false);
    setRemainingTime(timeout);

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingTime(warningTime);
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1000) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }, timeout - warningTime);

    // Set idle timer
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      setShowWarning(false);
      onIdle();
    }, timeout);

    if (onActive && isIdle) {
      onActive();
    }
  }, [timeout, warningTime, onIdle, onActive, isIdle]);

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      if (!isIdle) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimer, isIdle]);

  return {
    isIdle,
    showWarning,
    remainingTime,
    resetTimer,
  };
};
