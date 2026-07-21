'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { subscribePush, unsubscribePush } from '@/lib/push';
import { LogOut, User, Shield, Store, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { profile, logout } = useAuthStore();
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isOwner = profile?.role === 'owner';

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setPushEnabled(!!subscription);
        });
      });
    }
  }, []);

  const handleTogglePush = async () => {
    if (!profile?.id) return;
    setIsLoading(true);

    try {
      if (pushEnabled) {
        await unsubscribePush(profile.id);
        setPushEnabled(false);
        toast.success('Notifikasi dimatikan');
      } else {
        const success = await subscribePush(profile.id);
        if (success) {
          setPushEnabled(true);
          toast.success('Notifikasi diaktifkan');
        } else {
          toast.error('Gagal mengaktifkan notifikasi');
        }
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
    router.push('/login/');
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-top">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold text-neutral-800">
          Pengaturan
        </h1>
      </header>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-md border border-neutral-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">{profile?.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield size={12} className={isOwner ? 'text-primary-500' : 'text-secondary-500'} />
                <span className={`text-xs font-medium ${isOwner ? 'text-primary-600' : 'text-secondary-600'}`}>
                  {isOwner ? 'Owner' : 'Partner'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Push Notification Toggle */}
        <div className="bg-white rounded-md border border-neutral-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {pushEnabled ? (
                <Bell size={18} className="text-primary-500" />
              ) : (
                <BellOff size={18} className="text-neutral-400" />
              )}
              <div>
                <p className="text-sm font-medium text-neutral-800">Notifikasi Push</p>
                <p className="text-xs text-neutral-400">
                  {pushEnabled ? 'Aktif' : 'Nonaktif'}
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePush}
              disabled={isLoading}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                pushEnabled ? 'bg-primary-500' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  pushEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white rounded-md border border-neutral-100 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Store size={18} className="text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-800">Informasi Gerai</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Nama</span>
              <span className="text-neutral-800 font-medium">Gilang Fresh Juice</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Versi</span>
              <span className="text-neutral-800 font-medium">1.0.0</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 h-12 bg-danger-50 text-danger-600 rounded-md font-semibold text-sm border border-danger-200 active:scale-[0.98] transition-transform"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  );
}
