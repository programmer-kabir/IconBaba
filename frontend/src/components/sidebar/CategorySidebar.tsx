// frontend/components/sidebar/CategorySidebar.tsx
'use client';

import React from 'react';
import { CategoryItem, IconStyle } from '@/types/icon';
import { useIconCustomization } from '@/context/IconCustomizationContext';

interface CategorySidebarProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  totalIcons: number;
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  totalIcons,
}: CategorySidebarProps) {
  const { style, setStyle } = useIconCustomization();

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] flex flex-col border-r border-white/10 bg-[#12131d]">
      {/* Style Switcher: Filled vs Outlined */}
      <div className="p-4 border-b border-white/10">
        <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/10">
          <button
            type="button"
            onClick={() => setStyle('outlined')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              style === 'outlined'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Outlined
          </button>
          <button
            type="button"
            onClick={() => setStyle('filled')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              style === 'filled'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Filled
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* All Category Button */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
            selectedCategory === 'all'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <span>All Icons</span>
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
              selectedCategory === 'all' ? 'bg-purple-500/30 text-purple-200' : 'bg-white/5 text-slate-400'
            }`}
          >
            {totalIcons || 5148}
          </span>
        </button>

        {/* Individual Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono shrink-0 ml-2 ${
                  isSelected ? 'bg-purple-500/30 text-purple-200' : 'bg-white/5 text-slate-500'
                }`}
              >
                {cat.icon_count}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
