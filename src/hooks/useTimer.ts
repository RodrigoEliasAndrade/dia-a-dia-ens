import { useState, useRef, useCallback, useEffect } from 'react';
import { playTimerChime, triggerVibration, warmUpAudio } from '../utils/timerSound';

export interface UseTimerReturn {
  timeLeft: number;
  timerActive: boolean;
  isCompleted: boolean;
  start: (seconds: number) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  formatTime: (seconds: number) => string;
}

export function useTimer(): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setTimerActive(false);
  }, [clearTimer]);

  const start = useCallback((seconds: number) => {
    // Warm up AudioContext on user gesture (iOS requirement)
    warmUpAudio();

    stop();
    setIsCompleted(false);
    setTimeLeft(seconds);
    setTimerActive(true);

    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stop();
          setIsCompleted(true);
          playTimerChime();
          triggerVibration();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stop]);

  const pause = useCallback(() => {
    clearTimer();
    setTimerActive(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (timeLeft <= 0) return;
    setTimerActive(true);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stop();
          setIsCompleted(true);
          playTimerChime();
          triggerVibration();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timeLeft, stop]);

  const reset = useCallback(() => {
    stop();
    setTimeLeft(0);
    setIsCompleted(false);
  }, [stop]);

  const formatTime = useCallback((s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    timeLeft,
    timerActive,
    isCompleted,
    start,
    stop,
    pause,
    resume,
    reset,
    formatTime,
  };
}
