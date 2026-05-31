import { useEffect, useState } from 'react';

/**
 * Tracks browser online/offline state.
 *
 * NOTE: `navigator.onLine` reflects only whether the device has a network
 * interface — it doesn't guarantee the Supabase server is reachable. Good
 * enough as a fast signal; the synced-storage hook will still surface real
 * sync errors via its own state.
 */
export function useNetworkStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return { isOnline };
}
