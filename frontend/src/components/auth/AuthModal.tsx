// frontend/components/auth/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function calculatePasswordStrength(pass: string) {
  if (!pass) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (pass.length >= 12) score += 1;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak (min 8 chars with letter & number)', color: 'bg-rose-500' };
  if (score <= 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
  return { score: 3, label: 'Strong password', color: 'bg-emerald-500' };
}

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, login, register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'register') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        setError('Password must contain both letters and numbers.');
        return;
      }
    }

    setLoading(true);

    try {
      if (authMode === 'login') {
        const res = await login(email || username, password);
        if (!res.success) {
          setError(res.message || 'Invalid credentials');
        }
      } else {
        const res = await register(username, email, password, fullName);
        if (!res.success) {
          setError(res.message || 'Registration failed');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#12131e] border border-white/10 shadow-2xl p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <img
            src="/nav-logo.png"
            alt="IconBaba"
            className="h-10 mx-auto object-contain mb-3 filter drop-shadow-[0_2px_12px_rgba(168,85,247,0.35)]"
          />
          <h2 className="text-xl font-bold text-white tracking-tight">
            {authMode === 'login' ? 'Sign In to IconBaba' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authMode === 'login'
              ? 'Access your favorite icons, personal collections & pro features'
              : 'Join IconBaba to customize, collect and export 5,000+ vector icons'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              authMode === 'login' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              authMode === 'register' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2">
            <span className="shrink-0 text-rose-400">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {authMode === 'login' ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type={authMode === 'login' ? 'text' : 'email'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={authMode === 'login' ? 'admin@iconbaba.com or demo' : 'you@example.com'}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {/* Password strength meter for registration */}
            {authMode === 'register' && password && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{strength.label}</span>
                  {strength.score >= 3 && (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <ShieldCheck className="size-3" /> Secure
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : authMode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Credentials hint */}
        <div className="mt-5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 text-center">
          <span className="font-semibold text-purple-300">Admin Account:</span>{' '}
          <span className="font-mono text-slate-300">admin@iconbaba.com</span> /{' '}
          <span className="font-mono text-slate-300">admin123</span>
        </div>
      </div>
    </div>
  );
}
