'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { ProductGrid } from '@/components/sales/ProductGrid';
import { CartSheet } from '@/components/sales/CartSheet';
import { PaymentModal } from '@/components/sales/PaymentModal';
import { formatRupiah } from '@/lib/utils';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export default function NewSalePage() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const cart = useCartStore();
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'active'],
    queryFn: fetchProducts,
  });

  const handlePayment = async (paymentMethod: string) => {
    if (cart.items.length === 0) return;

    setIsSubmitting(true);
    try {
      const totalAmount = cart.getTotal();

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          total_amount: totalAmount,
          payment_method: paymentMethod,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.items.map((item) => ({
        sale_id: sale.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      toast.success(`Transaksi berhasil! ${sale.invoice_number}`);
      cart.clearCart();
      router.push('/sales/');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
      setShowPayment(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="safe-top pt-4 px-4 pb-3 border-b border-neutral-100 bg-white flex items-center gap-3">
        <Link href="/sales/" className="touch-target flex items-center justify-center">
          <ArrowLeft size={20} className="text-neutral-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-display font-bold text-neutral-800">
            Transaksi Baru
          </h1>
          <p className="text-xs text-neutral-400">
            {cart.getItemCount()} item · {formatRupiah(cart.getTotal())}
          </p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative w-10 h-10 flex items-center justify-center"
        >
          <ShoppingCart size={20} className="text-neutral-600" />
          {cart.items.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cart.items.length}
            </span>
          )}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-md p-4 h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <ProductGrid
            products={products || []}
            onSelect={(product) => {
              cart.addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
              });
              toast.success(`${product.name} ditambahkan`, { duration: 1000 });
            }}
          />
        )}
      </div>

      {cart.items.length > 0 && (
        <div className="p-4 border-t border-neutral-100 bg-white">
          <button
            onClick={() => setShowPayment(true)}
            disabled={isSubmitting}
            className="w-full h-12 bg-primary-500 text-white rounded-md font-semibold text-sm shadow-md active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {isSubmitting ? 'Memproses...' : `Bayar · ${formatRupiah(cart.getTotal())}`}
          </button>
        </div>
      )}

      <CartSheet open={showCart} onClose={() => setShowCart(false)} />
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        total={cart.getTotal()}
        onPay={handlePayment}
        isLoading={isSubmitting}
      />
    </div>
  );
}
