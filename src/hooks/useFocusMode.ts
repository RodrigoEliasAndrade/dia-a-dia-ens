import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseFocusModeReturn {
  /** Whether Focus Mode is currently active (wake lock held) */
  isActive: boolean;
  /** Whether the Wake Lock API is available in this browser */
  isSupported: boolean;
  /** Activate Focus Mode — requests screen wake lock */
  activate: () => Promise<void>;
  /** Deactivate Focus Mode — releases screen wake lock */
  deactivate: () => void;
  /** Toggle Focus Mode on/off */
  toggle: () => Promise<void>;
}

/**
 * Focus Mode hook — keeps the screen awake during prayer via Wake Lock API.
 *
 * - Acquires a screen wake lock so the device doesn't dim or lock.
 * - Re-acquires automatically when the tab returns to foreground
 *   (browsers release wake locks when a page is backgrounded).
 * - Auto-releases on unmount (navigating away from the flow).
 * - Graceful degradation: if the API isn't available (e.g., Firefox),
 *   `isSupported` is false but the toggle still works for the DND reminder UX.
 */
export function useFocusMode(): UseFocusModeReturn {
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Release the current wake lock
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Already released or error — safe to ignore
      }
      wakeLockRef.current = null;
    }
  }, []);

  // Request a new wake lock
  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      // Listen for the browser releasing the lock (e.g., tab backgrounded)
      wakeLockRef.current.addEventListener('release', () => {
        wakeLockRef.current = null;
      });
    } catch {
      // Permission denied or API error — silently degrade
    }
  }, [isSupported]);

  const activate = useCallback(async () => {
    await requestWakeLock();
    setIsActive(true);
  }, [requestWakeLock]);

  const deactivate = useCallback(() => {
    releaseWakeLock();
    setIsActive(false);
  }, [releaseWakeLock]);

  const toggle = useCallback(async () => {
    if (isActive) {
      deactivate();
    } else {
      await activate();
    }
  }, [isActive, activate, deactivate]);

  // Re-acquire wake lock when tab returns to foreground
  useEffect(() => {
    if (!isActive || !isSupported) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, isSupported, requestWakeLock]);

  // Cleanup on unmount — release wake lock
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);

  return {
    isActive,
    isSupported,
    activate,
    deactivate,
    toggle,
  };
}
