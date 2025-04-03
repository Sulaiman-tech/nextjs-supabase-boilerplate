'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      document.cookie = `sb-access-token=${data.session?.access_token}; max-age=7200; path=/`;
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen bg-blue-100 flex items-center justify-center overflow-hidden">
      {/* Animated Background Waves */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <svg
          className="absolute top-0 w-full h-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#3b82f6"
            fillOpacity="0.3"
            d="M0,192L60,192C120,192,240,192,360,186.7C480,181,600,171,720,176C840,181,960,203,1080,213.3C1200,224,1320,224,1380,224L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Login Card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-5"
      >
        <h1 className="text-3xl font-semibold text-center text-gray-800">Welcome Back</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
