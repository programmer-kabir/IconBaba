// frontend/components/grid/IconGrid.tsx
'use client';

import React from 'react';
import { IconItem } from '@/types/icon';
import { useIconCustomization } from '@/context/IconCustomizationContext';
import { applyCustomizationToSvg } from '@/lib/svg-utils';

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
  const { customization, style } = useIconCustomization();

  if (loading && icons.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-4">
        {Array.from({ length: 48 }).map((_, idx) => (
          <div
            key={idx}
            className="aspect-square rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse flex flex-col items-center justify-center p-4"
          >
            <div className="size-10 rounded-xl bg-white/5 mb-3" />
            <div className="h-3 w-16 rounded bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && icons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="size-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">No icons found</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          We couldn&apos;t find any icons matching your current search or category filter.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {icons.map((icon) => {
          const customizedSvg = applyCustomizationToSvg(icon.svg, customization, style);

          return (
            <div
              key={icon.id}
              onClick={() => onSelectIcon(icon)}
              className="group aspect-square rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer bg-[#141522] border border-white/5 hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-0.5"
            >
              {/* Glowing radial gradient hover background */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    'radial-gradient(180px circle at center, rgba(139, 92, 246, 0.18), transparent 70%)',
                }}
              />

              {/* Icon Preview */}
              <div
                className="relative z-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 mb-2"
                style={{ width: `${customization.size}px`, height: `${customization.size}px` }}
                dangerouslySetInnerHTML={{ __html: customizedSvg }}
              />

              {/* Icon Name */}
              <span className="relative z-10 text-[11px] font-medium text-slate-400 group-hover:text-slate-100 text-center truncate w-full px-1">
                {icon.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8 mb-6">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading icons...
              </>
            ) : (
              'Load More Icons'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
