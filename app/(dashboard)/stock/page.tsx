'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { formatNumber } from '@/lib/utils';
import { Package, AlertTriangle, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

async function fetchItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('is_active', true)
    .order('type')
    .order('name');

  if (error) throw error;
  return data || [];
}

export default function StockPage() {
  const { profile } = useAuthStore();
  const isOwner = profile?.role === 'owner';
  const [activeTab, setActiveTab] = useState<'all' | 'ingredient' | 'supply'>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: 'in' as 'in' | 'adjustment' | 'opname',
    quantity: '',
    unitPrice: '',
    reason: '',
    notes: '',
  });

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['stock', 'items'],
    queryFn: fetchItems,
  });

  const filteredItems = items?.filter((item) => 
    activeTab === 'all' ? true : item.type === activeTab
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const { error } = await supabase.from('stock_transactions').insert({
        item_id: selectedItem.id,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        unit_price: formData.unitPrice ? parseInt(formData.unitPrice) : null,
        reason: formData.reason,
        notes: formData.notes,
        created_by: profile?.id,
      });

      if (error) throw error;

      toast.success('Transaksi stok berhasil');
      setShowForm(false);
      setSelectedItem(null);
      setFormData({ type: 'in', quantity: '', unitPrice: '', reason: '', notes: '' });
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan');
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-top">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold text-neutral-800">
          Stok
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Monitoring bahan & perlengkapan
        </p>
      </header>

      <div className="flex gap-2 mb-4">
        {(['all', 'ingredient', 'supply'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {tab === 'all' ? 'Semua' : tab === 'ingredient' ? 'Bahan Baku' : 'Perlengkapan'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-md p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems?.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-md border p-4 shadow-sm ${
                item.current_stock <= item.min_stock 
                  ? 'border-secondary-200' 
                  : 'border-neutral-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                    item.type === 'ingredient' ? 'bg-primary-50' : 'bg-accent-500/10'
                  }`}>
                    <Package size={18} className={item.type === 'ingredient' ? 'text-primary-500' : 'text-accent-500'} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{item.name}</p>
                    <p className="text-xs text-neutral-400">
                      Rp {item.cost_price?.toLocaleString('id-ID')} / {item.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    {item.current_stock <= item.min_stock && (
                      <AlertTriangle size={14} className="text-secondary-500" />
                    )}
                    <span className={`text-sm font-bold ${
                      item.current_stock <= item.min_stock ? 'text-secondary-600' : 'text-neutral-800'
                    }`}>
                      {formatNumber(item.current_stock)}
                    </span>
                    <span className="text-xs text-neutral-400">{item.unit}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Min: {formatNumber(item.min_stock)} {item.unit}
                  </p>
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-50">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setFormData({ ...formData, type: 'in' });
                      setShowForm(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary-50 text-primary-600 rounded text-xs font-medium"
                  >
                    <Plus size={12} />
                    Masuk
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setFormData({ ...formData, type: 'adjustment' });
                      setShowForm(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-neutral-50 text-neutral-600 rounded text-xs font-medium"
                  >
                    <Minus size={12} />
                    Sesuaikan
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stock Form Modal */}
      {showForm && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-t-xl w-full max-w-[480px] mx-auto animate-in slide-in-from-bottom p-4">
            <h3 className="text-base font-display font-semibold mb-4">
              {formData.type === 'in' ? 'Stok Masuk' : 'Penyesuaian Stok'} — {selectedItem.name}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Jumlah ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full h-12 px-4 rounded-md border-[1.5px] border-neutral-200 focus:border-primary-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              {formData.type === 'in' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Harga per {selectedItem.unit} (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="w-full h-12 px-4 rounded-md border-[1.5px] border-neutral-200 focus:border-primary-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Alasan {formData.type !== 'in' && <span className="text-danger-500">*</span>}
                </label>
                <input
                  type="text"
                  required={formData.type !== 'in'}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full h-12 px-4 rounded-md border-[1.5px] border-neutral-200 focus:border-primary-500 focus:outline-none"
                  placeholder="Alasan perubahan..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Catatan
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full h-12 px-4 rounded-md border-[1.5px] border-neutral-200 focus:border-primary-500 focus:outline-none"
                  placeholder="Catatan tambahan..."
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
