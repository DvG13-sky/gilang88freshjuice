'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Receipt, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { href: '/dashboard/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sales/', label: 'Penjualan', icon: ShoppingCart },
  { href: '/stock/', label: 'Stok', icon: Package },
  { href: '/expenses/', label: 'Pengeluaran', icon: Receipt },
  { href: '/settings/', label: 'Pengaturan', icon: Settings },
];

const partnerNavItems = [
  { href: '/dashboard/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sales/', label: 'Penjualan', icon: ShoppingCart },
  { href: '/stock/', label: 'Stok', icon: Package },
  { href: '/expenses/', label: 'Pengeluaran', icon: Receipt },
];

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useAuthStore();

  const items = profile?.role === 'owner' ? navItems : partnerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-[480px] mx-auto flex justify-around items-center h-16">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full touch-target transition-colors ${
                isActive ? 'text-primary-500' : 'text-neutral-400'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
