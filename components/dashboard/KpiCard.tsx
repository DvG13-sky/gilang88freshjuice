'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatRupiah, formatNumber } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: 'primary' | 'secondary' | 'accent' | 'danger';
  trend?: number;
}

const colorMap = {
  primary: 'bg-primary-50 text-primary-600',
  secondary: 'bg-secondary-50 text-secondary-600',
  accent: 'bg-accent-500/10 text-accent-500',
  danger: 'bg-danger-50 text-danger-600',
};

export function KpiCard({ label, value, prefix, suffix, color, trend }: KpiCardProps) {
  const displayValue = prefix 
    ? formatRupiah(value) 
    : suffix 
      ? `${formatNumber(value)} ${suffix}`
      : formatNumber(value);

  return (
    <div className="bg-white rounded-md border border-neutral-100 p-4 shadow-sm">
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-display font-bold text-neutral-800 mt-1">
        {displayValue}
      </p>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${
          trend > 0 ? 'text-primary-500' : trend < 0 ? 'text-danger-500' : 'text-neutral-400'
        }`}>
          {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
}
