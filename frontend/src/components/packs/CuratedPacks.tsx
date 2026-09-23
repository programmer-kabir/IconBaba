// frontend/src/components/packs/CuratedPacks.tsx
'use client';

import React from 'react';
import { Sparkles, ArrowRight, Layers, Cpu, CreditCard, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CuratedPacksProps {
  onSelectPack: (searchTerm: string) => void;
}

const PACKS = [
  {
    id: 'fintech',
    title: 'FinTech & Web3',
    subtitle: 'Wallets, payment cards, cryptos & ledgers',
    count: '140+ Icons',
    icon: CreditCard,
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300',
    query: 'money',
  },
  {
    id: 'ai',
    title: 'AI & Machine Intelligence',
    subtitle: 'Neural processors, bots, magic & automation',
    count: '95+ Icons',
    icon: Cpu,
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300',
    query: 'cpu',
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce & Retail',
    subtitle: 'Shopping carts, price tags, delivery & rewards',
    count: '180+ Icons',
    icon: ShoppingBag,
    color: 'from-amber-500/20 to-rose-500/20 border-amber-500/30 text-amber-300',
    query: 'shop',
  },
  {
    id: 'security',
    title: 'Security & Verification',
    subtitle: 'Shields, locks, keys & identity tokens',
    count: '110+ Icons',
    icon: ShieldCheck,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
    query: 'shield',
  },
];

export default function CuratedPacks({ onSelectPack }: CuratedPacksProps) {
  return (
    <div className="w-full  mx-auto px-4 sm:px-6 py-6 border-b border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400">
            <Sparkles className="size-3.5" />
            <span>Curated Icon Packs</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Themed Bundles for Rapid Prototyping</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {PACKS.map((pack) => {
          const IconCmp = pack.icon;

          return (
            <div
              key={pack.id}
              onClick={() => onSelectPack(pack.query)}
              className={`p-4 rounded-2xl bg-gradient-to-br ${pack.color} border backdrop-blur-md hover:scale-[1.02] transition-all cursor-pointer group shadow-lg`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="size-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shadow-md">
                  <IconCmp className="size-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white font-semibold">
                  {pack.count}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                {pack.title}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">{pack.subtitle}</p>
              
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-white/80 group-hover:text-white transition-colors">
                <span>Explore Bundle</span>
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
