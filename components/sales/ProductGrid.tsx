'use client';

import { Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function ProductGrid({ products, onSelect }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onSelect(product)}
          className="bg-white rounded-md border border-neutral-100 p-4 text-left shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
        >
          <div className="w-full h-20 bg-primary-50 rounded-md mb-3 flex items-center justify-center">
            {product.photo_url ? (
              <img
                src={product.photo_url}
                alt={product.name}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <span className="text-2xl">🧃</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-neutral-800 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm font-bold text-primary-600 mt-1">
            {formatRupiah(product.price)}
          </p>
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
            <Plus size={14} className="text-white" />
          </div>
        </button>
      ))}
    </div>
  );
}
