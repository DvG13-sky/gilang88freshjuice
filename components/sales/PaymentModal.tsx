'use client';

import { formatRupiah } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/lib/constants';
import { X, Banknote, QrCode, ArrowLeftRight, MoreHorizontal } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Banknote,
  QrCode,
  ArrowLeftRight,
  MoreHorizontal,
};

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  onPay: (method: string) => void;
  isLoading: boolean;
}

export function PaymentModal({ open, onClose, total, onPay, isLoading }: PaymentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-xl w-full max-w-[480px] mx-auto animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <h2 className="text-base font-display font-semibold">Pembayaran</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        <div className="p-4">
          <div className="bg-primary-50 rounded-md p-4 text-center mb-4">
            <p className="text-xs text-primary-600 font-medium">Total Pembayaran</p>
            <p className="text-2xl font-display font-bold text-primary-700 mt-1">
              {formatRupiah(total)}
            </p>
          </div>

          <p className="text-xs text-neutral-400 font-medium mb-2">Pilih Metode</p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = iconMap[method.icon] || Banknote;
              return (
                <button
                  key={method.value}
                  onClick={() => onPay(method.value)}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-md border border-neutral-100 active:bg-primary-50 active:border-primary-200 transition-colors disabled:opacity-50"
                >
                  <Icon size={24} className="text-neutral-600 mb-2" />
                  <span className="text-sm font-medium text-neutral-800">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
