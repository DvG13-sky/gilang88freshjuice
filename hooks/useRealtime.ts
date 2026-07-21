'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useRealtimeDashboard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sales' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['sales'] });
          toast.success(`Transaksi baru: ${payload.new.invoice_number}`, {
            duration: 2000,
          });
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'expenses' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['expenses'] });
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'items' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['stock'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          if (payload.new.current_stock <= payload.new.min_stock) {
            toast.warning(`${payload.new.name} stok menipis!`, {
              duration: 4000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
