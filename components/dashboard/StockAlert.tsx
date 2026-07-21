'use client';

import { AlertTriangle, Package } from 'lucide-react';
import { Item } from '@/types';
import { formatNumber } from '@/lib/utils';

interface StockAlertProps {
  items: Item[];
}

export function StockAlert({ items }: StockAlertProps) {
  if (items.length === 0) {
    return (
      <div className="bg-primary-50 rounded-md p-4 text-center">
        <Package className="w-6 h-6 text-primary-500 mx-auto mb-2" />
        <p className="text-sm text-primary-600 font-medium">Semua stok aman</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center justify-between p-3 rounded-md border ${
            item.current_stock <= 0 
              ? 'bg-danger-50 border-danger-200' 
              : 'bg-secondary-50 border-secondary-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle 
              size={16} 
              className={item.current_stock <= 0 ? 'text-danger-500' : 'text-secondary-500'} 
            />
            <div>
              <p className="text-sm font-medium text-neutral-800">{item.name}</p>
              <p className="text-xs text-neutral-400">
                {formatNumber(item.current_stock)} {item.unit} (min: {formatNumber(item.min_stock)})
              </p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            item.current_stock <= 0 
              ? 'bg-danger-500 text-white' 
              : 'bg-secondary-500 text-white'
          }`}>
            {item.current_stock <= 0 ? 'Habis' : 'Menipis'}
          </span>
        </div>
      ))}
    </div>
  );
}
