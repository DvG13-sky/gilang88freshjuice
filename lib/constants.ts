export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Tunai', icon: 'Banknote' },
  { value: 'qris', label: 'QRIS', icon: 'QrCode' },
  { value: 'transfer', label: 'Transfer', icon: 'ArrowLeftRight' },
  { value: 'other', label: 'Lainnya', icon: 'MoreHorizontal' },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: 'pembelian_buah', label: 'Pembelian Buah', color: '#10B981' },
  { value: 'listrik', label: 'Listrik', color: '#F59E0B' },
  { value: 'air', label: 'Air', color: '#3B82F6' },
  { value: 'transport', label: 'Transport', color: '#8B5CF6' },
  { value: 'operasional_lainnya', label: 'Operasional Lainnya', color: '#6B7280' },
] as const;

export const ITEM_TYPES = [
  { value: 'ingredient', label: 'Bahan Baku' },
  { value: 'supply', label: 'Perlengkapan' },
] as const;

export const STOCK_TRANSACTION_TYPES = [
  { value: 'in', label: 'Stok Masuk' },
  { value: 'adjustment', label: 'Penyesuaian' },
  { value: 'opname', label: 'Stock Opname' },
] as const;
