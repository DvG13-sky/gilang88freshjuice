'use client';

import { useQuery } from '@tanstack/react-query';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { StockAlert } from '@/components/dashboard/StockAlert';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { useEffect } from 'react';
import { useRealtimeDashboard } from '@/hooks/useRealtime';

async function fetchDashboardData() {
  const today = new Date().toISOString().split('T')[0];

  const [statsResult, stockResult, topProductsResult] = await Promise.all([
    supabase.rpc('get_today_stats'),
    supabase.from('items').select('*').lte('current_stock', 'min_stock').eq('is_active', true),
    supabase.rpc('get_top_products_today', { limit_count: 5 }),
  ]);

  return {
    stats: statsResult.data || { omzet: 0, profit: 0, transaction_count: 0, expenses: 0 },
    lowStock: stockResult.data || [],
    topProducts: topProductsResult.data || [],
  };
}

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'today'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useRealtimeDashboard();

  const stats = data?.stats;
  const isOwner = profile?.role === 'owner';

  return (
    <div className="space-y-6 pb-24 px-4 pt-4 safe-top">
      <header>
        <h1 className="text-2xl font-display font-bold text-neutral-800">
          Dashboard
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          {formatDate(new Date())} · {profile?.full_name}
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-md p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-3">
          <KpiCard
            label="Omzet Hari Ini"
            value={stats?.omzet || 0}
            prefix="Rp"
            color="primary"
          />
          {isOwner && (
            <KpiCard
              label="Laba Hari Ini"
              value={stats?.profit || 0}
              prefix="Rp"
              color="accent"
            />
          )}
          <KpiCard
            label="Transaksi"
            value={stats?.transaction_count || 0}
            suffix="trx"
            color="secondary"
          />
          {isOwner && (
            <KpiCard
              label="Pengeluaran"
              value={stats?.expenses || 0}
              prefix="Rp"
              color="danger"
            />
          )}
        </section>
      )}

      <section>
        <h2 className="text-base font-display font-semibold mb-3">
          Stok Menipis
        </h2>
        <StockAlert items={data?.lowStock || []} />
      </section>

      <section>
        <h2 className="text-base font-display font-semibold mb-3">
          Produk Terlaris
        </h2>
        <div className="bg-white rounded-md border border-neutral-100 shadow-sm overflow-hidden">
          {(data?.topProducts || []).length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-400">
              Belum ada transaksi hari ini
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {(data?.topProducts || []).map((product: any, index: number) => (
                <div key={product.product_id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-secondary-500 text-white' :
                      index === 1 ? 'bg-neutral-400 text-white' :
                      index === 2 ? 'bg-accent-500 text-white' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-neutral-800">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-800">{product.total_qty} pcs</p>
                    <p className="text-xs text-neutral-400">
                      Rp {product.total_revenue?.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
