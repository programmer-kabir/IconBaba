// frontend/components/drawer/IconDetailDrawer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Heart,
  FolderPlus,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { IconItem, StrokeLinecap, StrokeLinejoin } from '@/types/icon';
import { useIconCustomization } from '@/context/IconCustomizationContext';
import { useAuth } from '@/context/AuthContext';
import {
  applyCustomizationToSvg,
  svgToJsx,
  downloadSvg,
  downloadPng,
  copyToClipboard,
} from '@/lib/svg-utils';
import {
  checkFavorite,
  addFavorite,
  removeFavorite,
  logDownload,
  getIcon,
  getIcons,
} from '@/lib/api';

interface IconDetailDrawerProps {
  icon: IconItem | null;
  onClose: () => void;
  onOpenAddToCollection: (icon: IconItem) => void;
  onSelectIcon?: (icon: IconItem) => void;
}

export default function IconDetailDrawer({
  icon,
  onClose,
  onOpenAddToCollection,
  onSelectIcon,
}: IconDetailDrawerProps) {
  const { customization: globalCustomization, style: globalStyle } = useIconCustomization();
  const { user, setShowAuthModal, setAuthMode } = useAuth();

  // Active icon inside modal
  const [currentIcon, setCurrentIcon] = useState<IconItem | null>(icon);
  const [localStyle, setLocalStyle] = useState<'outlined' | 'filled'>(globalStyle);
  const [variantsMap, setVariantsMap] = useState<{ outlined?: string; filled?: string }>({});
  const [relatedVariants, setRelatedVariants] = useState<IconItem[]>([]);

  // Local customization state for the modal only (does not mutate global grid settings)
  const [localCustom, setLocalCustom] = useState(globalCustomization);

  const [bgMode, setBgMode] = useState<'checkerboard' | 'dark' | 'light'>('checkerboard');
  const [copiedType, setCopiedType] = useState<'svg' | 'jsx' | 'name' | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);

  // Sync currentIcon when icon prop changes
  useEffect(() => {
    if (icon) {
      setCurrentIcon(icon);
      setLocalStyle(globalStyle);
      setLocalCustom({ ...globalCustomization });
    } else {
      setCurrentIcon(null);
    }
  }, [icon]);

  // Handle clean close
  const handleClose = () => {
    setCurrentIcon(null);
    onClose();
  };

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch icon style variants and related sister icons
  useEffect(() => {
    if (!currentIcon) return;

    let isMounted = true;

    // 1. Fetch single icon variants (both outlined and filled)
    getIcon(currentIcon.id).then((res) => {
      if (isMounted && res.success && res.data?.variants) {
        setVariantsMap(res.data.variants);
      }
    });

    // 2. Fetch related family variants
    const basePrefix = currentIcon.name.split('-')[0];
    if (basePrefix && basePrefix.length >= 2) {
      getIcons({ search: basePrefix, limit: 16, style: localStyle }).then((res) => {
        if (isMounted && res.success && res.data?.icons) {
          setRelatedVariants(res.data.icons.filter((i) => i.id !== currentIcon.id));
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [currentIcon, localStyle]);

  // Check if current icon is favorited by user
  useEffect(() => {
    if (!currentIcon || !user) {
      setIsFavorited(false);
      return;
    }

    let isMounted = true;
    checkFavorite(currentIcon.id).then((res) => {
      if (isMounted && res.success && res.data) {
        setIsFavorited(res.data.is_favorited);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentIcon, user]);

  if (!icon || !currentIcon) return null;

  // Choose the SVG based on selected localStyle variant
  const rawSvg =
    (localStyle === 'filled' && variantsMap.filled)
      ? variantsMap.filled
      : (variantsMap.outlined || currentIcon.svg);

  const customizedSvg = applyCustomizationToSvg(rawSvg, localCustom, localStyle);

  // Copy SVG
  const handleCopySvg = async () => {
    const ok = await copyToClipboard(customizedSvg);
    if (ok) {
      setCopiedType('svg');
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  // Copy JSX
  const handleCopyJsx = async () => {
    const compName = currentIcon.name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
    const jsx = svgToJsx(customizedSvg, `Icon${compName}`);
    const ok = await copyToClipboard(jsx);
    if (ok) {
      setCopiedType('jsx');
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  // Download SVG
  const handleDownloadSvg = async () => {
    downloadSvg(customizedSvg, `${currentIcon.name}-${localStyle}-${localCustom.size}px`);
    await logDownload(currentIcon.id, 'svg', localCustom.size);
  };

  // Download PNG
  const handleDownloadPng = async () => {
    setDownloadingPng(true);
    try {
      await downloadPng(customizedSvg, `${currentIcon.name}-${localStyle}-${localCustom.size}px`, localCustom.size * 2);
      await logDownload(currentIcon.id, 'png', localCustom.size);
    } catch (err) {
      console.error('PNG download failed:', err);
    } finally {
      setDownloadingPng(false);
    }
  };

  // Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentIcon.name} - IconBaba`,
          text: `Check out the ${currentIcon.name} icon on IconBaba!`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to copying URL below
      }
    }
    await copyToClipboard(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    setFavLoading(true);
    try {
      if (isFavorited) {
        await removeFavorite(currentIcon.id);
        setIsFavorited(false);
      } else {
        await addFavorite(currentIcon.id);
        setIsFavorited(true);
      }
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-[#12131d] border-l border-white/10 shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 sticky top-0 bg-[#12131d]/95 backdrop-blur-md z-10">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{currentIcon.name}</h3>
            <span className="text-xs text-purple-400 font-medium">{currentIcon.category}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              disabled={favLoading}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorited
                  ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <Heart className={`size-4 ${isFavorited ? 'fill-pink-400' : ''}`} />
            </button>

            {/* Add to Collection Button */}
            <button
              onClick={() => {
                if (!user) {
                  setAuthMode('login');
                  setShowAuthModal(true);
                  return;
                }
                onOpenAddToCollection(currentIcon);
              }}
              title="Add to Collection"
              aria-label="Add to Collection"
              className="p-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-white transition-colors"
            >
              <FolderPlus className="size-4" />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              title={copiedShare ? 'Link copied!' : 'Share Icon'}
              aria-label="Share Icon"
              className="p-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-white transition-colors"
            >
              {copiedShare ? <Check className="size-4 text-emerald-400" /> : <Share2 className="size-4" />}
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              aria-label="Close detail drawer"
              className="p-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-white transition-colors ml-1"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Big Preview Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            <div
              className={`w-full h-56 flex items-center justify-center transition-colors ${
                bgMode === 'checkerboard'
                  ? 'bg-checkerboard'
                  : bgMode === 'dark'
                  ? 'bg-[#090a0f]'
                  : 'bg-white'
              }`}
            >
              <div
                style={{
                  width: `${Math.max(64, localCustom.size * 1.5)}px`,
                  height: `${Math.max(64, localCustom.size * 1.5)}px`,
                }}
                className="flex items-center justify-center transition-all drop-shadow-md"
                dangerouslySetInnerHTML={{ __html: customizedSvg }}
              />
            </div>

            {/* Canvas Background Mode Selector */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
              <button
                onClick={() => setBgMode('checkerboard')}
                title="Checkerboard"
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  bgMode === 'checkerboard' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pattern
              </button>
              <button
                onClick={() => setBgMode('dark')}
                title="Dark Background"
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  bgMode === 'dark' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setBgMode('light')}
                title="Light Background"
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  bgMode === 'light' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Light
              </button>
            </div>
          </div>

          {/* Style Variants Selector (Outlined vs Filled) */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Style Variants
              </span>
              <span className="text-[10px] text-purple-400 font-medium capitalize">
                {localStyle} Selected
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Outlined variant button */}
              <button
                type="button"
                onClick={() => setLocalStyle('outlined')}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                  localStyle === 'outlined'
                    ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-md shadow-purple-600/10'
                    : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className="size-7 flex items-center justify-center shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: applyCustomizationToSvg(
                      variantsMap.outlined || currentIcon.svg,
                      { ...localCustom, size: 22 },
                      'outlined'
                    ),
                  }}
                />
                <div className="truncate">
                  <div className="text-xs font-semibold">Outlined</div>
                  <div className="text-[10px] text-slate-400">Stroke vector</div>
                </div>
              </button>

              {/* Filled variant button */}
              <button
                type="button"
                onClick={() => setLocalStyle('filled')}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                  localStyle === 'filled'
                    ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-md shadow-purple-600/10'
                    : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className="size-7 flex items-center justify-center shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: applyCustomizationToSvg(
                      variantsMap.filled || currentIcon.svg,
                      { ...localCustom, size: 22 },
                      'filled'
                    ),
                  }}
                />
                <div className="truncate">
                  <div className="text-xs font-semibold">Filled</div>
                  <div className="text-[10px] text-slate-400">Solid vector</div>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons: Download SVG, Download PNG, Copy SVG, Copy JSX */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadSvg}
              aria-label="Download SVG file"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20 transition-all"
            >
              <Download className="size-4" />
              Download SVG
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={downloadingPng}
              aria-label="Download PNG file"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <Download className="size-4" />
              {downloadingPng ? 'Exporting...' : 'Download PNG'}
            </button>

            <button
              onClick={handleCopySvg}
              aria-label="Copy SVG code to clipboard"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              {copiedType === 'svg' ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              {copiedType === 'svg' ? 'Copied SVG!' : 'Copy SVG'}
            </button>

            <button
              onClick={handleCopyJsx}
              aria-label="Copy React JSX component code to clipboard"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              {copiedType === 'jsx' ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              {copiedType === 'jsx' ? 'Copied JSX!' : 'Copy React JSX'}
            </button>
          </div>

          {/* Customization Details Controls (LOCAL TO THIS ICON ONLY) */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sliders className="size-3.5 text-purple-400" />
                Customize This Icon
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Modal only</span>
            </div>

            {/* Size Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Icon Size</span>
                <span className="font-mono text-purple-400">{localCustom.size}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="96"
                step="4"
                value={localCustom.size}
                onChange={(e) => setLocalCustom((prev) => ({ ...prev, size: Number(e.target.value) }))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Color Selector (Local to this icon) */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Icon Color</span>
                <span className="font-mono text-purple-400 text-[11px]">{localCustom.color}</span>
              </div>
              <div className="flex items-center gap-2">
                {['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setLocalCustom((prev) => ({ ...prev, color: c }))}
                    className={`size-6 rounded-lg border transition-transform ${
                      localCustom.color === c ? 'border-white scale-110 shadow-md' : 'border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
                <input
                  type="color"
                  value={localCustom.color}
                  onChange={(e) => setLocalCustom((prev) => ({ ...prev, color: e.target.value }))}
                  className="size-6 rounded cursor-pointer border-0 bg-transparent ml-auto"
                  title="Custom color picker"
                  aria-label="Custom color picker"
                />
              </div>
            </div>

            {/* Stroke Width Slider (Outlined) */}
            {localStyle === 'outlined' && (
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Stroke Width</span>
                  <span className="font-mono text-purple-400">{localCustom.strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={localCustom.strokeWidth}
                  onChange={(e) => setLocalCustom((prev) => ({ ...prev, strokeWidth: Number(e.target.value) }))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            )}

            {/* Line Cap & Line Join (Outlined) */}
            {localStyle === 'outlined' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Line Cap</span>
                  <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-center">
                    {(['round', 'butt', 'square'] as StrokeLinecap[]).map((cap) => (
                      <button
                        key={cap}
                        onClick={() => setLocalCustom((prev) => ({ ...prev, strokeLinecap: cap }))}
                        className={`py-1 text-[11px] font-medium capitalize rounded-lg transition-colors ${
                          localCustom.strokeLinecap === cap
                            ? 'bg-purple-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Line Join</span>
                  <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-center">
                    {(['round', 'bevel', 'miter'] as StrokeLinejoin[]).map((join) => (
                      <button
                        key={join}
                        onClick={() => setLocalCustom((prev) => ({ ...prev, strokeLinejoin: join }))}
                        className={`py-1 text-[11px] font-medium capitalize rounded-lg transition-colors ${
                          localCustom.strokeLinejoin === join
                            ? 'bg-purple-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {join}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Related Icon Variants (Sister Icons) */}
          {relatedVariants.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Sparkles className="size-3.5 text-purple-400" />
                  Related Icon Variants ({relatedVariants.length})
                </h4>
                <span className="text-[10px] text-slate-500">Click to switch</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                {relatedVariants.map((relIcon) => (
                  <button
                    key={relIcon.id}
                    type="button"
                    onClick={() => {
                      setCurrentIcon(relIcon);
                      onSelectIcon?.(relIcon);
                    }}
                    title={relIcon.name}
                    className="group aspect-square rounded-xl p-2 bg-black/40 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/40 flex flex-col items-center justify-center transition-all hover:scale-105"
                  >
                    <div
                      className="size-6 flex items-center justify-center mb-1 transition-transform group-hover:scale-110"
                      dangerouslySetInnerHTML={{
                        __html: applyCustomizationToSvg(relIcon.svg, { ...localCustom, size: 20 }, localStyle),
                      }}
                    />
                    <span className="text-[9px] text-slate-400 group-hover:text-white truncate w-full text-center">
                      {relIcon.name.replace(currentIcon.name.split('-')[0] + '-', '') || relIcon.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* UI Examples Preview */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="size-3.5 text-pink-400" />
              UI Component Examples
            </h4>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Badge with icon */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
                <div
                  className="size-4 flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: applyCustomizationToSvg(rawSvg, { ...localCustom, size: 14 }, localStyle),
                  }}
                />
                Verified
              </div>

              {/* Link with icon */}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:underline"
              >
                <div
                  className="size-4 flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: applyCustomizationToSvg(rawSvg, { ...localCustom, size: 14 }, localStyle),
                  }}
                />
                Explore More
              </a>

              {/* Action Button with icon */}
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-sm transition-colors">
                <div
                  className="size-4 flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: applyCustomizationToSvg(rawSvg, { ...localCustom, size: 14, color: '#ffffff' }, localStyle),
                  }}
                />
                Action
              </button>

              {/* Secondary Icon Button */}
              <button className="size-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 transition-colors">
                <div
                  className="size-4 flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: applyCustomizationToSvg(rawSvg, { ...localCustom, size: 16 }, localStyle),
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
