'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Topbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = 'sb-access-token=; max-age=0; path=/'; // Remove the cookie
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
}
