export interface Profile {
  id: string;
  access_code: string;
  role: 'owner' | 'partner';
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
  photo_url?: string;
  created_by?: string;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  type: 'ingredient' | 'supply';
  unit: string;
  cost_price: number;
  min_stock: number;
  current_stock: number;
  is_active: boolean;
  created_at: string;
}

export interface Recipe {
  id: string;
  product_id: string;
  is_active: boolean;
  recipe_items: RecipeItem[];
}

export interface RecipeItem {
  id: string;
  recipe_id: string;
  item_id: string;
  item?: Item;
  quantity: number;
}

export interface Sale {
  id: string;
  invoice_number: string;
  total_amount: number;
  total_hpp: number;
  total_profit: number;
  payment_method: 'cash' | 'qris' | 'transfer' | 'other';
  is_void: boolean;
  void_reason?: string;
  voided_by?: string;
  voided_at?: string;
  created_by?: string;
  created_at: string;
  sale_items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  hpp_per_unit: number;
  total_hpp: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  receipt_url?: string;
  is_void: boolean;
  void_reason?: string;
  voided_by?: string;
  voided_at?: string;
  created_by?: string;
  created_at: string;
}

export interface StockTransaction {
  id: string;
  item_id: string;
  item?: Item;
  type: 'in' | 'adjustment' | 'opname';
  quantity: number;
  unit_price?: number;
  total_price?: number;
  reason?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface DailyClosing {
  id: string;
  closing_date: string;
  total_omzet: number;
  total_hpp: number;
  total_profit: number;
  total_expense: number;
  transaction_count: number;
  product_snapshot: any[];
  stock_snapshot: any[];
  created_by?: string;
  created_at: string;
  is_locked: boolean;
}

export interface Notification {
  id: string;
  user_id?: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  updated_at: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface DashboardStats {
  omzet: number;
  profit: number;
  transaction_count: number;
  expenses: number;
}
