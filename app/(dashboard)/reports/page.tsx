'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { formatRupiah, formatDate } from '@/lib/utils';
import { Calendar, FileText } from 'lucide-react';

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: closing, isLoading } = useQuery({
    queryKey: ['closing', selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_closings')
        .select('*')
        .eq('closing_date', selectedDate)
        .single();

      if (error) return null;
      return data;
    },
  });

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-top">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold text-neutral-800">
          Laporan Harian
        </h1>
      </header>

      <div className="mb-4">
        <div className="flex items-center gap-2 bg-white border border-neutral-100 rounded-md p-3">
          <Calendar size={18} className="text-neutral-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 text-sm text-neutral-800 outline-none bg-transparent"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-md p-8 animate-pulse" />
      ) : !closing ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">
            Belum ada closing untuk tanggal {formatDate(selectedDate)}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-md border border-neutral-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Ringkasan</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-50 rounded-md p-3">
                <p className="text-xs text-primary-600">Omzet</p>
                <p className="text-lg font-bold text-primary-700">{formatRupiah(closing.total_omzet)}</p>
              </div>
              <div className="bg-accent-500/10 rounded-md p-3">
                <p className="text-xs text-accent-600">Laba</p>
                <p className="text-lg font-bold text-accent-700">{formatRupiah(closing.total_profit)}</p>
              </div>
              <div className="bg-secondary-50 rounded-md p-3">
                <p className="text-xs text-secondary-600">Transaksi</p>
                <p className="text-lg font-bold text-secondary-700">{closing.transaction_count} trx</p>
              </div>
              <div className="bg-danger-50 rounded-md p-3">
                <p className="text-xs text-danger-600">Pengeluaran</p>
                <p className="text-lg font-bold text-danger-700">{formatRupiah(closing.total_expense)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-neutral-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Produk Terlaris</h3>
            <div className="space-y-2">
              {(closing.product_snapshot || []).map((product: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-400 w-4">{idx + 1}</span>
                    <span className="text-sm text-neutral-800">{product.name}</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-600">{product.quantity} pcs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
