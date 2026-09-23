// frontend/src/components/grid/IconGrid.tsx
'use client';

import React, { useState } from 'react';
import { Check, Copy, Lock } from 'lucide-react';
import { IconItem } from '@/types/icon';
import { useIconCustomization } from '@/context/IconCustomizationContext';
import { useAuth } from '@/context/AuthContext';
import { applyCustomizationToSvg } from '@/lib/svg-utils';
import { trackExport } from '@/lib/api';
import ProtectedCanvasPreview from '@/components/common/ProtectedCanvasPreview';
import PricingModal from '@/components/pricing/PricingModal';

interface IconGridProps {
  icons: IconItem[];
  loading: boolean;
  onSelectIcon: (icon: IconItem) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
}

export default function IconGrid({
  icons,
  loading,
  onSelectIcon,
  hasMore,
  onLoadMore,
  loadingMore,
}: IconGridProps) {
  const { customization, style, quickCopyMode } = useIconCustomization();
  const { user, setShowAuthModal, setAuthMode } = useAuth();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedLockedIcon, setSelectedLockedIcon] = useState<IconItem | null>(null);

  const isProUser = Boolean(
    user && (
      ['pro', 'premium', 'admin'].includes(user.role?.toLowerCase()) ||
      (user.roles && user.roles.some((r) => ['pro', 'premium', 'admin'].includes(r.toLowerCase())))
    )
  );

  const handleCardClick = async (icon: IconItem, customizedSvg: string) => {
    if (quickCopyMode) {
      if (!user) {
        setAuthMode('login');
        setShowAuthModal(true);
        return;
      }
      if (icon.is_premium && !isProUser) {
        setSelectedLockedIcon(icon);
        setShowPricingModal(true);
        return;
      }
      const res = await trackExport({ iconId: icon.id, action: 'copy', format: 'svg' });
      if (!res.success) {
        if (res.data?.require_login || res.message?.toLowerCase().includes('guest limit') || res.message?.toLowerCase().includes('sign in')) {
          setAuthMode('login');
          setShowAuthModal(true);
          return;
        }
        if (res.data?.require_pro || res.message?.toLowerCase().includes('free limit') || res.message?.toLowerCase().includes('pro')) {
          setSelectedLockedIcon(icon);
          setShowPricingModal(true);
          return;
        }
      }

      navigator.clipboard.writeText(customizedSvg);
      setCopiedId(icon.id);
      setCopiedToast(`Copied "${icon.name}" SVG to clipboard!`);
      setTimeout(() => {
        setCopiedId(null);
        setCopiedToast(null);
      }, 2000);
    } else {
      onSelectIcon(icon);
    }
  };

  if (loading && icons.length === 0) {
    return (
      <div className=" mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {Array.from({ length: 48 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse flex flex-col items-center justify-center p-4"
            >
              <div className="size-10 rounded-xl bg-white/5 mb-3" />
              <div className="h-3 w-16 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && icons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="size-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-xl">
          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No vector icons found</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          We couldn&apos;t find any icons matching your current search or category query.
        </p>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-4 sm:p-6 relative">
      
      {/* 1-Click Quick Copy Toast Banner */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-emerald-500/90 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="size-4 shrink-0" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Grid of Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {icons.map((icon) => {
          const customizedSvg = applyCustomizationToSvg(icon.svg, customization, style);
          const isRecentlyCopied = copiedId === icon.id;

          return (
            <div
              key={icon.id}
              onClick={() => handleCardClick(icon, customizedSvg)}
              onContextMenu={(e) => {
                // Layer 3 Security: Disable right-click context menu (blocks "Inspect" & "Save Image")
                e.preventDefault();
              }}
              className={`group aspect-square rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none bg-[#12131e]/90 border transition-all duration-200 hover:-translate-y-1 shadow-sm ${
                isRecentlyCopied
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/20'
                  : quickCopyMode
                  ? 'border-emerald-500/20 hover:border-emerald-500/60 hover:shadow-emerald-950/30'
                  : icon.is_premium
                  ? 'border-amber-500/20 hover:border-amber-500/50 hover:shadow-amber-950/20'
                  : 'border-white/5 hover:border-purple-500/40 hover:shadow-purple-950/30'
              }`}
              title={quickCopyMode ? `Click to instantly copy "${icon.name}" SVG` : `Click to inspect "${icon.name}"${icon.is_premium ? ' (PRO)' : ''}`}
            >
              {/* Radial gradient glow background */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: quickCopyMode
                    ? 'radial-gradient(140px circle at center, rgba(16, 185, 129, 0.15), transparent 70%)'
                    : 'radial-gradient(140px circle at center, rgba(168, 85, 247, 0.15), transparent 70%)',
                }}
              />

              {/* Pro Crown Badge Indicator */}
              {icon.is_premium && (
                <div 
                  className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm pointer-events-none"
                  title="👑 Pro Icon"
                >
                  <span>👑</span>
                  <span className="font-extrabold">PRO</span>
                </div>
              )}

              {/* Quick Copy Badge Indicator on Card */}
              {quickCopyMode && (
                <div className="absolute top-2 right-2 p-1 rounded-md bg-white/5 text-slate-400 group-hover:text-emerald-300 group-hover:bg-emerald-500/20 transition-all opacity-0 group-hover:opacity-100">
                  {isRecentlyCopied ? (
                    <Check className="size-3 text-emerald-400" />
                  ) : !user || (icon.is_premium && !isProUser) ? (
                    <Lock className="size-3 text-amber-400" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </div>
              )}

              {/* Layer 3: Protected Canvas Vector Preview (Zero <svg> or <path> nodes in the DOM) */}
              <div
                className="relative z-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 mb-2 pointer-events-none"
                style={{ 
                  width: `${Math.min(customization.size, 52)}px`, 
                  height: `${Math.min(customization.size, 52)}px` 
                }}
              >
                <ProtectedCanvasPreview
                  svgContent={customizedSvg}
                  size={Math.min(customization.size, 52)}
                />
              </div>

              {/* Icon Name */}
              <span className="relative z-10 text-[11px] font-medium text-slate-400 group-hover:text-slate-100 text-center truncate w-full px-1">
                {isRecentlyCopied ? (
                  <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <Check className="size-3" /> Copied!
                  </span>
                ) : (
                  icon.name
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-10 mb-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-7 py-3 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-xl shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
          >
            {loadingMore ? (
              <>
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading more vector icons...</span>
              </>
            ) : (
              <span>Load More Vector Icons ({icons.length} shown)</span>
            )}
          </button>
        </div>
      )}
      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        reason="pro_icon"
        iconName={selectedLockedIcon?.name}
      />
    </div>
  );
}
