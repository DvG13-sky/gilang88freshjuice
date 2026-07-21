'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { formatRupiah, formatDate } from '@/lib/utils';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ClosingPage() {
  const { profile } = useAuthStore();
  const [isClosing, setIsClosing] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const { data: todayStats, refetch } = useQuery({
    queryKey: ['today-stats-for-closing'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_today_stats');
      return data;
    },
  });

  const { data: existingClosing } = useQuery({
    queryKey: ['closing-check', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_closings')
        .select('*')
        .eq('closing_date', today)
        .single();
      return data;
    },
  });

  const handleClosing = async () => {
    if (!profile?.id) return;
    setIsClosing(true);
    try {
      const { data, error } = await supabase.rpc('perform_daily_closing', {
        closing_date_param: today,
        user_uuid: profile.id,
      });

      if (error) throw error;

      toast.success('Daily closing berhasil!');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Gagal melakukan closing');
    } finally {
      setIsClosing(false);
    }
  };

  const isOwner = profile?.role === 'owner';

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Lock className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">Hanya Owner yang bisa melakukan Daily Closing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-top">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold text-neutral-800">
          Daily Closing
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          {formatDate(new Date())}
        </p>
      </header>

      {existingClosing ? (
        <div className="bg-primary-50 rounded-md p-6 text-center border border-primary-200">
          <CheckCircle className="w-12 h-12 text-primary-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-primary-700">Closing Sudah Dilakukan</h3>
          <p className="text-sm text-primary-600 mt-1">
            Data untuk hari ini sudah terkunci
          </p>
          <div className="mt-4 space-y-2 text-left bg-white rounded-md p-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Omzet</span>
              <span className="font-semibold text-neutral-800">{formatRupiah(existingClosing.total_omzet)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Laba</span>
              <span className="font-semibold text-neutral-800">{formatRupiah(existingClosing.total_profit)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Transaksi</span>
              <span className="font-semibold text-neutral-800">{existingClosing.transaction_count} trx</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-md border border-neutral-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Ringkasan Hari Ini</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Omzet</span>
                <span className="font-semibold text-neutral-800">{formatRupiah(todayStats?.omzet || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Laba</span>
                <span className="font-semibold text-neutral-800">{formatRupiah(todayStats?.profit || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Transaksi</span>
                <span className="font-semibold text-neutral-800">{todayStats?.transaction_count || 0} trx</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary-50 rounded-md p-4 border border-secondary-200">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-secondary-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-secondary-700">Perhatian</p>
                <p className="text-xs text-secondary-600 mt-0.5">
                  Setelah closing, data tidak bisa diubah. Pastikan semua transaksi sudah benar.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClosing}
            disabled={isClosing}
            className="w-full h-12 bg-primary-500 text-white rounded-md font-semibold text-sm shadow-md active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {isClosing ? 'Memproses...' : 'Lakukan Daily Closing'}
          </button>
        </div>
      )}
    </div>
  );
}
