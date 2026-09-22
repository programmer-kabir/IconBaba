// frontend/components/toolbar/ControlsToolbar.tsx
'use client';

import React, { useState } from 'react';
import { Search, X, ChevronDown, Minus, Plus } from 'lucide-react';
import { useIconCustomization } from '@/context/IconCustomizationContext';
import { StrokeLinecap, StrokeLinejoin } from '@/types/icon';

interface ControlsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalIconsFound: number;
}

const COLOR_PRESETS = [
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'White', value: '#ffffff' },
  { label: 'Dark', value: '#1e293b' },
];

const SIZE_PRESETS = [16, 20, 24, 32, 48, 64];

export default function ControlsToolbar({
  searchQuery,
  onSearchChange,
  totalIconsFound,
}: ControlsToolbarProps) {
  const {
    customization,
    setSize,
    setColor,
    setStrokeWidth,
    setStrokeLinecap,
    setStrokeLinejoin,
    style,
  } = useIconCustomization();

  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [lineCapMenuOpen, setLineCapMenuOpen] = useState(false);
  const [lineJoinMenuOpen, setLineJoinMenuOpen] = useState(false);

  return (
    <div className="w-full shrink-0 z-30 pt-3 pb-3 px-4 sm:px-6 bg-[#0d0e15] border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search ${totalIconsFound.toLocaleString()} icons...`}
          className="w-full h-10 pl-10 pr-9 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Customization Controls Toolbar */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* Size Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setSizeMenuOpen(!sizeMenuOpen);
              setColorMenuOpen(false);
              setLineCapMenuOpen(false);
              setLineJoinMenuOpen(false);
            }}
            className="h-10 px-3 flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
          >
            <span>{customization.size}px</span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>

          {sizeMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSizeMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-28 rounded-xl bg-[#141522] border border-white/10 shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                {SIZE_PRESETS.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      setSize(sz);
                      setSizeMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium ${
                      customization.size === sz
                        ? 'bg-purple-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Color Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setColorMenuOpen(!colorMenuOpen);
              setSizeMenuOpen(false);
              setLineCapMenuOpen(false);
              setLineJoinMenuOpen(false);
            }}
            className="h-10 px-3 flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
          >
            <div
              className="size-4 rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: customization.color }}
            />
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>

          {colorMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setColorMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#141522] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preset Colors</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setColor(preset.value);
                        setColorMenuOpen(false);
                      }}
                      title={preset.label}
                      className="size-8 rounded-lg border border-white/10 flex items-center justify-center hover:scale-110 transition-transform"
                      style={{ backgroundColor: preset.value }}
                    />
                  ))}
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                  <input
                    type="color"
                    value={customization.color}
                    onChange={(e) => setColor(e.target.value)}
                    className="size-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={customization.color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stroke Width Stepper (Only visible in outlined style) */}
        {style === 'outlined' && (
          <div className="flex items-center h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <button
              onClick={() => setStrokeWidth(customization.strokeWidth - 0.5)}
              disabled={customization.strokeWidth <= 1}
              className="size-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Decrease Stroke Width"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-[2.2rem] text-center font-mono text-xs font-semibold text-slate-200">
              {customization.strokeWidth}
            </span>
            <button
              onClick={() => setStrokeWidth(customization.strokeWidth + 0.5)}
              disabled={customization.strokeWidth >= 4}
              className="size-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Increase Stroke Width"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        )}

        {/* Line Cap Selector (Outlined) */}
        {style === 'outlined' && (
          <div className="relative">
            <button
              onClick={() => {
                setLineCapMenuOpen(!lineCapMenuOpen);
                setSizeMenuOpen(false);
                setColorMenuOpen(false);
                setLineJoinMenuOpen(false);
              }}
              title="Stroke Line Cap"
              className="h-10 px-3 flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors capitalize"
            >
              <span>Cap: {customization.strokeLinecap}</span>
              <ChevronDown className="size-3 text-slate-400" />
            </button>

            {lineCapMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLineCapMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-28 rounded-xl bg-[#141522] border border-white/10 shadow-xl p-1 z-50">
                  {(['round', 'butt', 'square'] as StrokeLinecap[]).map((cap) => (
                    <button
                      key={cap}
                      onClick={() => {
                        setStrokeLinecap(cap);
                        setLineCapMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs capitalize ${
                        customization.strokeLinecap === cap
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Line Join Selector (Outlined) */}
        {style === 'outlined' && (
          <div className="relative">
            <button
              onClick={() => {
                setLineJoinMenuOpen(!lineJoinMenuOpen);
                setSizeMenuOpen(false);
                setColorMenuOpen(false);
                setLineCapMenuOpen(false);
              }}
              title="Stroke Line Join"
              className="h-10 px-3 flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors capitalize"
            >
              <span>Join: {customization.strokeLinejoin}</span>
              <ChevronDown className="size-3 text-slate-400" />
            </button>

            {lineJoinMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLineJoinMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-28 rounded-xl bg-[#141522] border border-white/10 shadow-xl p-1 z-50">
                  {(['round', 'bevel', 'miter'] as StrokeLinejoin[]).map((join) => (
                    <button
                      key={join}
                      onClick={() => {
                        setStrokeLinejoin(join);
                        setLineJoinMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs capitalize ${
                        customization.strokeLinejoin === join
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {join}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
