'use client';

import { usePWAUpdate } from '@/hooks/usePWAUpdate';

export function UpdatePrompt() {
  const { needRefresh, updateApp } = usePWAUpdate();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50">
      <div className="bg-neutral-800 text-white rounded-xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">Update Tersedia</p>
          <p className="text-xs text-neutral-300">Versi baru siap diinstall</p>
        </div>
        <button 
          onClick={updateApp}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-semibold active:scale-95 transition-transform"
        >
          Update
        </button>
      </div>
    </div>
  );
}
