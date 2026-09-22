// admin/src/pages/SettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { getMe, updateProfile } from '../lib/api';
import { User } from '../types/icon';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const res = await getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setFullName(res.data.user.full_name || '');
      }
    }
    loadUser();
  }, []);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    try {
      const res = await updateProfile(fullName, password || undefined);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setPassword('');
        setMsg({ type: 'success', text: 'Admin profile updated successfully!' });
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to update profile' });
      }
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Update error' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage administrator account details, security credentials, and system environment status.
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Account Settings */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-base font-bold text-white">Administrator Credentials</h2>

        <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
            <input
              type="text"
              disabled
              value={user?.username || ''}
              className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              New Password <span className="text-slate-500 font-normal">(Leave blank to keep current)</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-colors"
            >
              {submitting ? 'Updating...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* System Status */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">System Environment</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Frontend Admin:</span>
            <span className="font-semibold text-emerald-400">Vite + React SPA (Static / cPanel Ready)</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Backend API:</span>
            <span className="font-semibold text-slate-200">PHP 8.x / Apache (CORS Enabled)</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Database Engine:</span>
            <span className="font-semibold text-slate-200">MySQL / PDO</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Security / Auth:</span>
            <span className="font-semibold text-emerald-400">Role-Based Bearer Tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
}
