'use client';

import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerBackgroundSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      setIsSyncing(true);
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-sales');
        await registration.sync.register('sync-expenses');
        await registration.sync.register('sync-stock');
      } catch (e) {
        console.error('Background sync failed:', e);
      }
      setTimeout(() => setIsSyncing(false), 2000);
    }
  };

  return { isOnline, isSyncing };
}
