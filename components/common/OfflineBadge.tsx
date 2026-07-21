'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';

export function OfflineBadge() {
  const { isOnline, isSyncing } = useNetworkStatus();

  if (isOnline && !isSyncing) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 safe-top ${isOnline ? 'bg-primary-500' : 'bg-neutral-800'} text-white text-center py-1.5`}>
      <div className="flex items-center justify-center gap-1.5 text-xs font-medium">
        {!isOnline && <WifiOff size={12} />}
        <span>
          {!isOnline 
            ? 'Mode Offline — Data tersimpan lokal' 
            : isSyncing 
              ? 'Menyinkronkan data...' 
              : ''}
        </span>
      </div>
    </div>
  );
}
