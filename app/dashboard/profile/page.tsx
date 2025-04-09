'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handlePasswordUpdate = async () => {
    setStatus('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('Error: ' + error.message);
    } else {
      setStatus('Password updated successfully.');
      setPassword('');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:text-white">
      {/* Hero Section */}
      <div
        className="relative h-52 w-full bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white dark:text-white">
            Welcome, {user.email}
          </h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto mt-8 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-[#00acc1] dark:text-white">Account Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <ProfileItem label="Email" value={user.email} />
          <ProfileItem label="Created On" value={new Date(user.created_at).toLocaleDateString()} />
          {user.last_sign_in_at && (
            <ProfileItem label="Last Login" value={new Date(user.last_sign_in_at).toLocaleDateString()} />
          )}
        </div>

        {/* Password Update */}
        <div className="mt-8 pt-4 border-t border-gray-300 dark:border-gray-700">
          <h2 className="text-xs mb-2 text-gray-800 dark:text-gray-300">Update Password</h2>
          <input
            type="password"
            className="w-full bg-white border text-sm border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c6ff]"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handlePasswordUpdate}
            className="mt-3 w-full bg-[#00acc1] text-white text-sm py-2 px-4 rounded transition"
          >
            Save Password
          </button>
          {status && <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{status}</p>}
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-600 dark:text-gray-400 text-xs tracking-wide">{label}</p>
      <p className="mt-1 text-gray-900 dark:text-white text-sm">{value}</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0097a2] border-t-transparent mb-4"></div>
    </div>
  );
}
