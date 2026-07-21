'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import { Plus, Receipt, Ban } from 'lucide-react';

async function fetchSales() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*, products(name))')
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export default function SalesPage() {
  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales', 'today'],
    queryFn: fetchSales,
  });

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-top">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-800">
            Penjualan
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Transaksi hari ini
          </p>
        </div>
        <Link
          href="/sales/new/"
          className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </Link>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-md p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : sales?.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">Belum ada transaksi hari ini</p>
          <Link
            href="/sales/new/"
            className="inline-block mt-4 text-sm text-primary-600 font-medium"
          >
            Buat transaksi baru →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sales?.map((sale: any) => (
            <div
              key={sale.id}
              className={`bg-white rounded-md border p-4 shadow-sm ${
                sale.is_void ? 'border-danger-200 bg-danger-50/30' : 'border-neutral-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-800">
                      {sale.invoice_number}
                    </p>
                    {sale.is_void && (
                      <span className="flex items-center gap-1 text-xs text-danger-500 bg-danger-50 px-1.5 py-0.5 rounded">
                        <Ban size={10} />
                        Void
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {formatDateTime(sale.created_at)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {sale.sale_items?.map((item: any, idx: number) => (
                      <span key={idx} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                        {item.products?.name} x{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${sale.is_void ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}>
                    {formatRupiah(sale.total_amount)}
                  </p>
                  <p className="text-xs text-neutral-400 capitalize mt-0.5">
                    {sale.payment_method}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
