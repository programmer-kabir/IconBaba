// frontend/src/components/header/SiteHeader.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Heart, Folder, History, LogOut, Sparkles, Shield, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SiteHeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function SiteHeader({ onToggleSidebar, sidebarOpen = false }: SiteHeaderProps) {
  const { user, logout, setShowAuthModal, setAuthMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  const isAdmin = Boolean(user && (user.roles?.includes('admin') || user.role === 'admin'));
  const currentToken = typeof window !== 'undefined' ? localStorage.getItem('iconbaba_token') : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d0e15]/90 backdrop-blur-md">
      <div className="px-4 sm:px-6 flex h-16 items-center justify-between">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden transition-colors"
              aria-label="Toggle Category Sidebar"
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img
              src="/nav-logo.png"
              alt="IconBaba"
              className="h-10 sm:h-8 w-auto object-contain filter drop-shadow-[0_2px_12px_rgba(168,85,247,0.35)]"
            />
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              5,000+ Icons
            </span>
          </Link>
        </div>

        {/* Right: External links, Auth buttons, and Site Nav Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Twitter link (matching reference) */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="IconBaba on Twitter"
            title="Follow on Twitter"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* Admin panel direct quick-switcher for admins */}
          {isAdmin && (
            <a
              href={`http://localhost:3001${currentToken ? `?token=${currentToken}` : ''}`}
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 border border-purple-500/30 text-xs font-semibold transition-all shadow-sm shadow-purple-950"
              title="Open Admin Dashboard"
            >
              <Shield className="size-3.5 text-purple-400" />
              <span>Admin Panel</span>
              <ExternalLink className="size-3 opacity-60 ml-0.5" />
            </a>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-slate-200 transition-colors"
              >
                <div className="size-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                  {user.username.charAt(0)}
                </div>
                <span className="hidden sm:inline-block max-w-[100px] truncate text-slate-200">
                  {user.full_name || user.username}
                </span>
                {isAdmin && (
                  <span className="hidden lg:inline-block text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Admin
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#141522] border border-white/10 shadow-2xl p-2 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-white/10 mb-1.5">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-sm font-semibold text-white truncate">{user.full_name || user.username}</p>
                        {isAdmin ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap">
                            Admin & User
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            User
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <a
                        href={`http://localhost:3001${currentToken ? `?token=${currentToken}` : ''}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-200 hover:text-white bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all mb-1.5 shadow-sm"
                      >
                        <Shield className="size-4 text-purple-400" />
                        <span>Admin Dashboard</span>
                        <ExternalLink className="size-3 ml-auto opacity-70" />
                      </a>
                    )}

                    <Link
                      to="/favorites"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Heart className="size-4 text-pink-400" />
                      My Favorites
                      {user.stats?.favorites_count !== undefined && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-400">
                          {user.stats.favorites_count}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/collections"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Folder className="size-4 text-purple-400" />
                      My Collections
                      {user.stats?.collections_count !== undefined && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-400">
                          {user.stats.collections_count}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <History className="size-4 text-indigo-400" />
                      Download History
                    </Link>

                    <div className="border-t border-white/10 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 transition-all"
              >
                Sign up
              </button>
            </div>
          )}

          {/* Site Navigation Dropdown (3-line Menu Button matching Iconic) */}
          <div className="relative">
            <button
              onClick={() => setNavMenuOpen(!navMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors flex items-center justify-center"
              aria-label="Open Navigation Menu"
              title="Navigation Menu"
            >
              {navMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            {navMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNavMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#141522] border border-white/10 shadow-2xl p-2 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  {/* Main Pages */}
                  <div className="py-1">
                    <Link
                      to="/pricing"
                      onClick={() => setNavMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Pricing
                    </Link>
                    <Link
                      to="/faq"
                      onClick={() => setNavMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      FAQ&apos;s
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setNavMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Contact
                    </Link>
                  </div>

                  <div className="border-t border-white/10 my-1.5" />

                  {/* Licenses Section */}
                  <div className="px-3 pt-1 pb-1">
                    <Link
                      to="/licenses"
                      onClick={() => setNavMenuOpen(false)}
                      className="text-[11px] font-bold tracking-wider text-slate-400 hover:text-purple-300 transition-colors block"
                    >
                      Licenses
                    </Link>
                  </div>
                  <div className="py-0.5">
                    <Link
                      to="/licenses/free"
                      onClick={() => setNavMenuOpen(false)}
                      className="flex items-center px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Free License
                    </Link>
                    <Link
                      to="/licenses/pro"
                      onClick={() => setNavMenuOpen(false)}
                      className="flex items-center px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Pro License
                    </Link>
                  </div>

                  <div className="border-t border-white/10 my-1.5" />

                  {/* Legal Section */}
                  <div className="px-3 pt-1 pb-1">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 block">
                      Legal
                    </span>
                  </div>
                  <div className="py-0.5">
                    <Link
                      to="/terms"
                      onClick={() => setNavMenuOpen(false)}
                      className="flex items-center px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Terms
                    </Link>
                    <Link
                      to="/privacy-policy"
                      onClick={() => setNavMenuOpen(false)}
                      className="flex items-center px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      to="/refund-policy"
                      onClick={() => setNavMenuOpen(false)}
                      className="flex items-center px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Refund Policy
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
