'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { Receipt, Plus, Ban } from 'lucide-react';
import { toast } from 'sonner';

async function fetchExpenses() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export default function ExpensesPage() {
  const { profile } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'pembelian_buah',
    amount: '',
    description: '',
  });

  const { data: expenses, isLoading, refetch } = useQuery({
    queryKey: ['expenses', 'today'],
    queryFn: fetchExpenses,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('expenses').insert({
        category: formData.category,
        amount: parseInt(formData.amount),
        description: formData.description,
        created_by: profile?.id,
      });

      if (error) throw error;

      toast.success('Pengeluaran tersimpan');
      setShowForm(false);
      setFormData({ category: 'pembelian_buah', amount: '', description: '' });
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan');
    }
  };

  const totalExpenses = expenses?.reduce((sum, exp) => 
    exp.is_void ? sum : sum + exp.amount, 0
  ) || 0;

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-top">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-800">
            Pengeluaran
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Total hari ini: {formatRupiah(totalExpenses)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-md p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : expenses?.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">Belum ada pengeluaran hari ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses?.map((expense: any) => {
            const category = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
            return (
              <div
                key={expense.id}
                className={`bg-white rounded-md border p-4 shadow-sm ${
                  expense.is_void ? 'border-danger-200 bg-danger-50/30' : 'border-neutral-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category?.color || '#6B7280' }}
                      />
                      <p className="text-sm font-medium text-neutral-800">
                        {category?.label || expense.category}
                      </p>
                      {expense.is_void && (
                        <span className="flex items-center gap-1 text-xs text-danger-500 bg-danger-50 px-1.5 py-0.5 rounded">
                          <Ban size={10} />
                          Void
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {formatDateTime(expense.created_at)}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">{expense.description}</p>
                  </div>
                  <p className={`text-sm font-bold ${expense.is_void ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}>
                    {formatRupiah(expense.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-t-xl w-full max-w-[480px] mx-auto animate-in slide-in-from-bottom p-4">
            <h3 className="text-base font-display font-semibold mb-4">Tambah Pengeluaran</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-12 px-4 rounded-md border-[1.5px] border-neutral-200 focus:border-primary-500 focus:outline-none bg-white"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-12 px-4 rounded-md border-[1.5px] border-neutral-200 focus:border-primary-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Keterangan</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-12 px-4 rounded-md border-[1.5px] border-neutral-200 focus:border-primary-500 focus:outline-none"
                  placeholder="Keterangan pengeluaran..."
                />
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-primary-500 text-white rounded-md font-semibold text-sm shadow-md active:scale-[0.98] transition-transform"
              >
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
