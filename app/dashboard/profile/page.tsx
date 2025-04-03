'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
      }
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

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-800">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 px-4 py-8">
      <div className="max-w-md mx-auto border border-gray-200 rounded-md shadow-sm p-6">
        <h1 className="text-2xl font-semibold mb-6 text-center">Your Profile</h1>

        <div className="space-y-4 text-sm">
          <ProfileItem label="Email" value={user.email} />
          <ProfileItem
            label="Account Created"
            value={new Date(user.created_at).toLocaleDateString()}
          />
          {user.last_sign_in_at && (
            <ProfileItem
              label="Last Sign-In"
              value={new Date(user.last_sign_in_at).toLocaleDateString()}
            />
          )}
        </div>

        {/* Password Update */}
        <div className="mt-6 pt-4 border-t">
          <h2 className="text-sm font-medium mb-2">Update Password</h2>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handlePasswordUpdate}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded"
          >
            Save Password
          </button>
          {status && (
            <p className="mt-2 text-xs text-gray-600">
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}
