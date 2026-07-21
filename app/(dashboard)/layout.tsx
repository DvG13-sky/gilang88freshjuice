'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { BottomNav } from '@/components/layout/BottomNav';
import { OfflineBadge } from '@/components/common/OfflineBadge';
import { UpdatePrompt } from '@/components/common/UpdatePrompt';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !profile) {
      router.push('/login/');
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav />
      <OfflineBadge />
      <UpdatePrompt />
    </div>
  );
}
