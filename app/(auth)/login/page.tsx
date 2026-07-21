'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { GlassWater } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setProfile } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Masukkan kode akses');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('login_with_code', {
        input_code: code.trim(),
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('Kode akses tidak valid');
        setIsLoading(false);
        return;
      }

      const profile = data[0];
      setProfile(profile);
      toast.success(`Selamat datang, ${profile.full_name}!`);
      router.push('/dashboard/');
    } catch (err: any) {
      toast.error(err.message || 'Gagal login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <GlassWater className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold text-neutral-800">
          Gilang Fresh Juice
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Sistem Tata Kelola Gerai
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">
            Kode Akses
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Masukkan kode akses..."
            className="w-full h-12 px-4 rounded-md border-[1.5px] border-neutral-200 bg-white text-neutral-800 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none transition-colors"
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary-500 text-white rounded-md font-semibold text-sm shadow-md active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Memuat...' : 'Masuk'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-400">
          Kode Owner: <span className="font-mono text-neutral-600">Gilang_go</span>
        </p>
        <p className="text-xs text-neutral-400 mt-0.5">
          Kode Partner: <span className="font-mono text-neutral-600">yowes123</span>
        </p>
      </div>
    </div>
  );
}
