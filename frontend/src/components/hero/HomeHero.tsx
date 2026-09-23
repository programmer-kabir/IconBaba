// frontend/src/components/hero/HomeHero.tsx
'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Smartphone, 
  Layers, 
  Code2, 
  Zap, 
  Shield, 
  Heart, 
  Compass, 
  Sliders, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { useIconCustomization } from '@/context/IconCustomizationContext';

interface HomeHeroProps {
  onSelectTag: (tag: string) => void;
  totalIcons: number;
}

const FEATURED_HERO_ICONS = [
  { 
    name: 'Zap', 
    icon: Zap, 
    tags: ['energy', 'fast', 'power'],
    path: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />' 
  },
  { 
    name: 'Shield', 
    icon: Shield, 
    tags: ['security', 'protect', 'safe'],
    path: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />' 
  },
  { 
    name: 'Sparkles', 
    icon: Sparkles, 
    tags: ['ai', 'magic', 'clean'],
    path: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />' 
  },
  { 
    name: 'Heart', 
    icon: Heart, 
    tags: ['like', 'love', 'favorite'],
    path: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />' 
  },
  { 
    name: 'Compass', 
    icon: Compass, 
    tags: ['navigation', 'explore', 'map'],
    path: '<circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />' 
  },
  { 
    name: 'Sliders', 
    icon: Sliders, 
    tags: ['settings', 'controls', 'tuning'],
    path: '<line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" /><line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" /><line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" /><line x1="1" x2="7" y1="14" y2="14" /><line x1="9" x2="15" y1="8" y2="8" /><line x1="17" x2="23" y1="16" y2="16" />' 
  },
];

const TRENDING_TAGS = [
  { label: '🔥 Trending', query: 'trend' },
  { label: '⚡ Navigation', query: 'arrow' },
  { label: '🛡️ Security', query: 'shield' },
  { label: '🤖 AI & Cyber', query: 'cpu' },
  { label: '💳 FinTech', query: 'wallet' },
  { label: '🛍️ E-Commerce', query: 'cart' },
  { label: '📱 Mobile UI', query: 'user' },
];

export default function HomeHero({ onSelectTag, totalIcons }: HomeHeroProps) {
  const { customization } = useIconCustomization();
  const [activeIconIndex, setActiveIconIndex] = useState(0);
  const [activeStage, setActiveStage] = useState<'mockup' | 'card' | 'code'>('mockup');
  const [activeCodeTab, setActiveCodeTab] = useState<'jsx' | 'inline' | 'svg'>('jsx');
  const [copied, setCopied] = useState(false);

  const selectedHeroIcon = FEATURED_HERO_ICONS[activeIconIndex];
  const IconComponent = selectedHeroIcon.icon;

  const currentSize = customization.size || 24;
  const currentColor = customization.color || '#a855f7';
  const currentStrokeWidth = customization.strokeWidth || 2;

  // Self-contained code templates (No NPM installation required)
  const codeTemplates = {
    jsx: `// React JSX Component (Zero dependencies - Drop into any React / Next.js app)
export function ${selectedHeroIcon.name}Icon({ 
  size = ${currentSize}, 
  color = "${currentColor}", 
  strokeWidth = ${currentStrokeWidth}, 
  className = "", 
  ...props 
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      ${selectedHeroIcon.path}
    </svg>
  );
}`,
    inline: `// Inline React JSX (Paste directly inside your component)
<svg
  xmlns="http://www.w3.org/2000/svg"
  width={${currentSize}}
  height={${currentSize}}
  viewBox="0 0 24 24"
  fill="none"
  stroke="${currentColor}"
  strokeWidth={${currentStrokeWidth}}
  strokeLinecap="round"
  strokeLinejoin="round"
>
  ${selectedHeroIcon.path}
</svg>`,
    svg: `<!-- Raw Vector SVG (Universal HTML / Figma) -->
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="${currentSize}" 
  height="${currentSize}" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="${currentColor}" 
  stroke-width="${currentStrokeWidth}" 
  stroke-linecap="round" 
  stroke-linejoin="round"
>
  ${selectedHeroIcon.path}
</svg>`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeTemplates[activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-8 sm:pt-10 sm:pb-12 border-b border-white/10 bg-gradient-to-b from-[#090a10] via-[#0d0e17] to-[#090a10]">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className=" mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Story & Mission */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold backdrop-blur-md">
              <span className="flex size-2 rounded-full bg-purple-400 animate-pulse" />
              <span>IconBaba Studio 2.0</span>
              <span className="text-white/20">|</span>
              <span className="text-slate-300">{totalIcons.toLocaleString()}+ Vector Icons</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              The Modern Vector Icon Ecosystem for{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                Next-Gen Interfaces
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
              Precision-crafted, customizable SVGs with live stroke, size, and multi-tone tuning. Built for developers, designers, and creators who need clean vector graphics and instant React &amp; Vue code.
            </p>

            {/* Quick stats & features badges */}
            <div className="grid grid-cols-3 gap-3 pt-1 max-w-md">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="text-base font-bold text-white">{totalIcons.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400">Icons in Catalog</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="text-base font-bold text-purple-400">0 KB</div>
                <div className="text-[11px] text-slate-400">Zero Dependencies</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="text-base font-bold text-emerald-400">MIT</div>
                <div className="text-[11px] text-slate-400">Free for Commercial</div>
              </div>
            </div>

            {/* Trending Quick Search Pills */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                <Flame className="size-3.5 text-amber-400" />
                <span>Trending Explorations:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag.query}
                    onClick={() => onSelectTag(tag.query)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer flex items-center gap-1.5 group"
                  >
                    <span>{tag.label}</span>
                    <ArrowRight className="size-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Component Sandbox */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-[#12131f]/90 border border-white/15 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
              
              {/* Sandbox Top Bar: Icon Selector */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Component Stage</span>
                </div>
                
                {/* Quick Icon Selector Chips */}
                <div className="flex items-center gap-1">
                  {FEATURED_HERO_ICONS.map((item, idx) => (
                    <button
                      key={item.name}
                      onClick={() => setActiveIconIndex(idx)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        activeIconIndex === idx
                          ? 'bg-purple-600/30 border-purple-500 text-purple-300 scale-105'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      title={item.name}
                    >
                      <item.icon className="size-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode Switcher: Mockup vs Glass Card vs Code Exporter */}
              <div className="grid grid-cols-3 p-1 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold text-slate-300">
                <button
                  onClick={() => setActiveStage('mockup')}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeStage === 'mockup' ? 'bg-purple-600 text-white shadow-md' : 'hover:text-white'
                  }`}
                >
                  <Smartphone className="size-3.5" />
                  <span>Mobile UI</span>
                </button>
                <button
                  onClick={() => setActiveStage('card')}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeStage === 'card' ? 'bg-purple-600 text-white shadow-md' : 'hover:text-white'
                  }`}
                >
                  <Layers className="size-3.5" />
                  <span>Glass Card</span>
                </button>
                <button
                  onClick={() => setActiveStage('code')}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeStage === 'code' ? 'bg-purple-600 text-white shadow-md' : 'hover:text-white'
                  }`}
                >
                  <Code2 className="size-3.5" />
                  <span>Code Snippet</span>
                </button>
              </div>

              {/* Live Stage Display Canvas */}
              <div className="min-h-[220px] flex items-center justify-center rounded-2xl bg-gradient-to-br from-black/60 to-purple-950/20 border border-white/10 p-4 relative overflow-hidden">
                
                {/* 1. Mobile UI Mockup Stage */}
                {activeStage === 'mockup' && (
                  <div className="w-full max-w-xs space-y-4">
                    {/* Simulated App Header / Card */}
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-3">
                      <div 
                        className="size-10 rounded-xl flex items-center justify-center transition-all shadow-md"
                        style={{ backgroundColor: `${currentColor}20`, border: `1px solid ${currentColor}40` }}
                      >
                        <IconComponent 
                          size={24} 
                          color={currentColor} 
                          strokeWidth={currentStrokeWidth} 
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white capitalize">{selectedHeroIcon.name} Action</div>
                        <div className="text-[10px] text-slate-400">Triggered in application flow</div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                        Active
                      </span>
                    </div>

                    {/* Simulated Mobile Bottom Tab Bar */}
                    <div className="p-2.5 rounded-2xl bg-[#090a12]/90 border border-white/15 flex items-center justify-around shadow-2xl">
                      <div className="flex flex-col items-center gap-1 text-slate-400 hover:text-white cursor-pointer">
                        <Compass className="size-4" />
                        <span className="text-[9px]">Explore</span>
                      </div>
                      
                      {/* Active Center Icon Highlight */}
                      <div className="flex flex-col items-center gap-1 text-purple-300 scale-110 cursor-pointer">
                        <div 
                          className="size-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${currentColor}25`, border: `1px solid ${currentColor}50` }}
                        >
                          <IconComponent 
                            size={18} 
                            color={currentColor} 
                            strokeWidth={currentStrokeWidth} 
                          />
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1 text-slate-400 hover:text-white cursor-pointer">
                        <Heart className="size-4" />
                        <span className="text-[9px]">Saved</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Glass Card Stage */}
                {activeStage === 'card' && (
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 backdrop-blur-xl shadow-2xl text-center max-w-xs space-y-3">
                    <div 
                      className="size-16 mx-auto rounded-2xl flex items-center justify-center transition-all shadow-xl"
                      style={{ 
                        backgroundColor: `${currentColor}15`, 
                        border: `1px solid ${currentColor}40`,
                        boxShadow: `0 0 30px ${currentColor}25`
                      }}
                    >
                      <IconComponent 
                        size={36} 
                        color={currentColor} 
                        strokeWidth={currentStrokeWidth} 
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedHeroIcon.name} Feature</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">High-fidelity vector integration with customizable attributes.</p>
                    </div>
                    <button 
                      className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-white transition-all shadow-md"
                      style={{ backgroundColor: currentColor }}
                    >
                      Interactive Action
                    </button>
                  </div>
                )}

                {/* 3. Code Exporter Stage */}
                {activeStage === 'code' && (
                  <div className="w-full h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1.5">
                        {[
                          { id: 'jsx', label: 'React JSX' },
                          { id: 'inline', label: 'Inline' },
                          { id: 'svg', label: 'Raw SVG' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setActiveCodeTab(t.id as any)}
                            className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase font-bold transition-all ${
                              activeCodeTab === t.id
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-slate-200 transition-colors"
                      >
                        {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-purple-200 overflow-x-auto text-left leading-relaxed max-h-36">
                      <code>{codeTemplates[activeCodeTab]}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Bottom Quick Action Note */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Active Icon: <strong className="text-white">{selectedHeroIcon.name}</strong></span>
                <span className="font-mono text-purple-300">{currentSize}px / {currentStrokeWidth}px</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
