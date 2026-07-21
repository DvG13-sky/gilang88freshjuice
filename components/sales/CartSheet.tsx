'use client';

import { useCartStore } from '@/stores/cartStore';
import { formatRupiah } from '@/lib/utils';
import { Minus, Plus, Trash2, X } from 'lucide-react';

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CartSheet({ open, onClose }: CartSheetProps) {
  const cart = useCartStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <h2 className="text-base font-display font-semibold">Keranjang</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.items.length === 0 ? (
            <p className="text-center text-sm text-neutral-400 py-8">Keranjang kosong</p>
          ) : (
            cart.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between bg-neutral-50 rounded-md p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{item.name}</p>
                  <p className="text-xs text-neutral-400">{formatRupiah(item.price)} / pcs</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 bg-white border border-neutral-200 rounded flex items-center justify-center"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 bg-white border border-neutral-200 rounded flex items-center justify-center"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => cart.removeItem(item.productId)}
                    className="w-7 h-7 text-danger-500 flex items-center justify-center ml-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="p-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-600">Total</span>
              <span className="text-lg font-bold text-neutral-800">{formatRupiah(cart.getTotal())}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
