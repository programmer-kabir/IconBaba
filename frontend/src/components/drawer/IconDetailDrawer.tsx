// frontend/components/drawer/IconDetailDrawer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Zap,
  Lock,
} from 'lucide-react';
import { IconItem, StrokeLinecap, StrokeLinejoin, QuotaStatus } from '@/types/icon';
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
  getQuotaStatus,
  trackExport,
} from '@/lib/api';
import PricingModal from '@/components/pricing/PricingModal';

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

  const isProUser = Boolean(
    user && (
      ['pro', 'premium', 'admin'].includes(user.role?.toLowerCase()) ||
      (user.roles && user.roles.some((r) => ['pro', 'premium', 'admin'].includes(r.toLowerCase())))
    )
  );

  // Active icon inside modal
  const [currentIcon, setCurrentIcon] = useState<IconItem | null>(icon);
  const isPremiumIcon = Boolean(
    currentIcon?.is_premium === true ||
    Number((currentIcon as any)?.is_premium) === 1 ||
    (currentIcon as any)?.is_premium === '1' ||
    icon?.is_premium === true ||
    Number((icon as any)?.is_premium) === 1 ||
    (currentIcon as any)?.tier === 'pro'
  );
  const isIconLocked = Boolean(isPremiumIcon && !isProUser);
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
  const [quota, setQuota] = useState<QuotaStatus | null>(null);

  // Pricing Modal state
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingReason, setPricingReason] = useState<'pro_icon' | 'quota_reached' | 'general'>('pro_icon');

  const isDailyLimitReached = Boolean(user && quota && !quota.is_unlimited && quota.remaining <= 0);
  const isActionLocked = Boolean(!user || isIconLocked || isDailyLimitReached);

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

  // Fetch daily export quota status
  useEffect(() => {
    if (icon) {
      getQuotaStatus().then((res) => {
        if (res.success && res.data) {
          setQuota(res.data);
        }
      });
    }
  }, [icon, user]);

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
      if (isMounted && res.success && res.data) {
        if (res.data.variants) {
          setVariantsMap(res.data.variants);
        }
        if (res.data.is_premium !== undefined) {
          setCurrentIcon((prev) => (prev ? { ...prev, is_premium: Boolean(res.data!.is_premium) } : null));
        }
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

  // Layer 4 Security: Validates quota before allowing copy or download
  const verifyAndConsumeQuota = async (action: 'copy' | 'download', format: 'svg' | 'png' | 'jsx'): Promise<boolean> => {
    if (isIconLocked) {
      setPricingReason('pro_icon');
      setShowPricingModal(true);
      return false;
    }
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return false;
    }
    if (isDailyLimitReached) {
      setPricingReason('quota_reached');
      setShowPricingModal(true);
      return false;
    }
    if (!currentIcon) return false;
    const res = await trackExport({
      iconId: currentIcon.id,
      action,
      format,
      size: localCustom.size,
    });

    if (!res.success) {
      if (res.data?.require_login || res.message?.toLowerCase().includes('guest limit') || res.message?.toLowerCase().includes('sign in')) {
        setAuthMode('login');
        setShowAuthModal(true);
        return false;
      }
      if (res.data?.require_pro || res.message?.toLowerCase().includes('free limit') || res.message?.toLowerCase().includes('pro')) {
        setPricingReason(isPremiumIcon ? 'pro_icon' : 'quota_reached');
        setShowPricingModal(true);
        return false;
      }
      return false;
    }

    if (res.data?.quota) {
      setQuota(res.data.quota);
    }
    return true;
  };

  // Copy SVG
  const handleCopySvg = async () => {
    if (isIconLocked) {
      setPricingReason('pro_icon');
      setShowPricingModal(true);
      return;
    }
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (isDailyLimitReached) {
      setPricingReason('quota_reached');
      setShowPricingModal(true);
      return;
    }
    const ok = await verifyAndConsumeQuota('copy', 'svg');
    if (!ok) return;

    const copied = await copyToClipboard(customizedSvg);
    if (copied) {
      setCopiedType('svg');
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  // Copy JSX
  const handleCopyJsx = async () => {
    if (isIconLocked) {
      setPricingReason('pro_icon');
      setShowPricingModal(true);
      return;
    }
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (isDailyLimitReached) {
      setPricingReason('quota_reached');
      setShowPricingModal(true);
      return;
    }
    const ok = await verifyAndConsumeQuota('copy', 'jsx');
    if (!ok) return;

    const compName = currentIcon.name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
    const jsx = svgToJsx(customizedSvg, `Icon${compName}`);
    const copied = await copyToClipboard(jsx);
    if (copied) {
      setCopiedType('jsx');
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  // Download SVG
  const handleDownloadSvg = async () => {
    if (isIconLocked) {
      setPricingReason('pro_icon');
      setShowPricingModal(true);
      return;
    }
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (isDailyLimitReached) {
      setPricingReason('quota_reached');
      setShowPricingModal(true);
      return;
    }
    const ok = await verifyAndConsumeQuota('download', 'svg');
    if (!ok) return;

    downloadSvg(customizedSvg, `${currentIcon.name}-${localStyle}-${localCustom.size}px`);
  };

  // Download PNG
  const handleDownloadPng = async () => {
    if (isIconLocked) {
      setPricingReason('pro_icon');
      setShowPricingModal(true);
      return;
    }
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (isDailyLimitReached) {
      setPricingReason('quota_reached');
      setShowPricingModal(true);
      return;
    }
    const ok = await verifyAndConsumeQuota('download', 'png');
    if (!ok) return;

    setDownloadingPng(true);
    try {
      await downloadPng(customizedSvg, `${currentIcon.name}-${localStyle}-${localCustom.size}px`, localCustom.size * 2);
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
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-xl md:max-w-2xl bg-[#12131d] border-l border-white/10 shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 sticky top-0 bg-[#12131d]/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">{currentIcon.name}</h3>
              {currentIcon.is_premium && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm">
                  <span>👑</span>
                  <span>PRO</span>
                </span>
              )}
            </div>
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
              className={`w-full flex items-center justify-center p-6 overflow-auto transition-all ${
                bgMode === 'checkerboard'
                  ? 'bg-checkerboard'
                  : bgMode === 'dark'
                  ? 'bg-[#090a0f]'
                  : 'bg-white'
              }`}
              style={{
                minHeight: `${Math.min(560, Math.max(260, localCustom.size + 48))}px`,
              }}
            >
              <div
                style={{
                  width: `${localCustom.size}px`,
                  height: `${localCustom.size}px`,
                  maxWidth: '100%',
                }}
                className="flex items-center justify-center transition-all drop-shadow-md shrink-0 [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: customizedSvg }}
              />
            </div>

            {/* Canvas Background Mode Selector */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
              <button
                onClick={() => setBgMode('checkerboard')}
                title="Checkerboard"
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${bgMode === 'checkerboard' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
              >
                Pattern
              </button>
              <button
                onClick={() => setBgMode('dark')}
                title="Dark Background"
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${bgMode === 'dark' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
              >
                Dark
              </button>
              <button
                onClick={() => setBgMode('light')}
                title="Light Background"
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${bgMode === 'light' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
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
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${localStyle === 'outlined'
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
                disabled={!Boolean(variantsMap.filled)}
                onClick={() => setLocalStyle('filled')}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                  !variantsMap.filled
                    ? 'opacity-35 cursor-not-allowed bg-black/20 border-white/5 text-slate-500'
                    : localStyle === 'filled'
                    ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-md shadow-purple-600/10'
                    : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={!variantsMap.filled ? 'Filled variant is not available for this stroke icon' : 'Switch to filled'}
              >
                <div
                  className="size-7 flex items-center justify-center shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: applyCustomizationToSvg(
                      variantsMap.filled || currentIcon.svg,
                      { ...localCustom, size: 22 },
                      variantsMap.filled ? 'filled' : 'outlined'
                    ),
                  }}
                />
                <div className="truncate">
                  <div className="text-xs font-semibold">Filled</div>
                  <div className="text-[10px] text-slate-400">
                    {variantsMap.filled ? 'Solid vector' : 'Outline only'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Daily Quota Indicator Badge */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              {!user ? (
                <div
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors"
                >
                  <Lock className="size-3.5 text-amber-400" />
                  <span className="text-[11px]">
                    Downloads & vector copying locked • <strong className="text-purple-400 hover:underline">Sign in to unlock</strong>
                  </span>
                </div>
              ) : quota?.is_unlimited ? (
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                  <Zap className="size-3.5 fill-amber-400" /> Pro Member • Unlimited Access
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${quota?.remaining && quota.remaining > 5 ? 'bg-emerald-400' : (quota?.remaining ?? 0) > 0 ? 'bg-amber-400' : 'bg-red-400'} animate-pulse`} />
                  <span className="text-slate-300 text-[11px]">
                    Daily Free Quota: <strong className="text-white font-mono">{quota?.remaining ?? 20}/{quota?.limit ?? 20}</strong> icons left
                  </span>
                </div>
              )}
            </div>
            {!user ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                Sign In ↗
              </button>
            ) : !quota?.is_unlimited ? (
              <button
                type="button"
                onClick={() => {
                  setPricingReason('general');
                  setShowPricingModal(true);
                }}
                className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                Upgrade to Pro ↗
              </button>
            ) : null}
          </div>

          {/* Pro Icon Banner if icon is locked */}
          {isIconLocked && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-yellow-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="size-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-lg shrink-0">
                  👑
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-200">Exclusive Pro Icon</h4>
                  <p className="text-[11px] text-amber-300/80">
                    {user ? 'This vector icon is exclusive to Pro members. Upgrade to Pro to download and copy with unlimited commercial license.' : 'Sign in to your Pro account or upgrade to unlock this vector icon.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPricingReason('pro_icon');
                  setShowPricingModal(true);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/25 transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👑</span>
                <span>Upgrade to Pro</span>
              </button>
            </div>
          )}

          {/* Daily Limit Reached Banner */}
          {!isIconLocked && isDailyLimitReached && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-amber-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-rose-500/5">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="size-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 text-lg shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-200">Daily Free Limit Reached (20/20)</h4>
                  <p className="text-[11px] text-slate-300">
                    You have used your 20 free vector icon downloads for today. Upgrade to Pro for unlimited downloads & copies!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPricingReason('quota_reached');
                  setShowPricingModal(true);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <span>Upgrade to Pro ↗</span>
              </button>
            </div>
          )}

          {/* Action Buttons: Download SVG, Download PNG, Copy SVG, Copy JSX */}
          <div className="space-y-2.5">
            {!user && (
              <div
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-indigo-500/10 border border-purple-500/25 hover:border-purple-500/40 flex items-center justify-between gap-2 cursor-pointer transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2.5 text-xs text-purple-200">
                  <div className="size-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Lock className="size-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block text-[11px]">Actions Locked</span>
                    <span className="text-[10px] text-slate-300">Sign in to unlock free SVG & PNG downloads and JSX copies</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-purple-400 group-hover:text-purple-300 flex items-center gap-1 shrink-0 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  Sign In →
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {/* Download SVG */}
              <button
                onClick={handleDownloadSvg}
                aria-label="Download SVG file"
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                  isIconLocked
                    ? 'bg-amber-500/15 text-amber-200 border border-amber-500/40 hover:bg-amber-500/25 hover:border-amber-400/60 shadow-md'
                    : isActionLocked
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 hover:bg-purple-600/50 hover:border-purple-400/60 shadow-md'
                    : 'text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20'
                }`}
              >
                {isActionLocked ? (
                  <Lock className="size-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                ) : (
                  <Download className="size-4" />
                )}
                <span>Download SVG</span>
                {isIconLocked && (
                  <Lock className="size-3 text-amber-400/90 ml-1 shrink-0" />
                )}
              </button>

              {/* Download PNG */}
              <button
                onClick={handleDownloadPng}
                disabled={downloadingPng}
                aria-label="Download PNG file"
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                  isIconLocked
                    ? 'text-amber-200 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400/50'
                    : isActionLocked
                    ? 'text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40'
                    : 'text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                {isActionLocked ? (
                  <Lock className="size-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                ) : (
                  <Download className="size-4" />
                )}
                <span>{downloadingPng ? 'Exporting...' : 'Download PNG'}</span>
                {isIconLocked && (
                  <Lock className="size-3 text-amber-400/90 ml-1 shrink-0" />
                )}
              </button>

              {/* Copy SVG */}
              <button
                onClick={handleCopySvg}
                aria-label="Copy SVG code to clipboard"
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                  isIconLocked
                    ? 'text-amber-200 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400/50'
                    : isActionLocked
                    ? 'text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40'
                    : 'text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                {isActionLocked ? (
                  <Lock className="size-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                ) : copiedType === 'svg' ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
                <span>{copiedType === 'svg' ? 'Copied SVG!' : 'Copy SVG'}</span>
                {isIconLocked && (
                  <Lock className="size-3 text-amber-400/90 ml-1 shrink-0" />
                )}
              </button>

              {/* Copy React JSX */}
              <button
                onClick={handleCopyJsx}
                aria-label="Copy React JSX component code to clipboard"
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                  isIconLocked
                    ? 'text-amber-200 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400/50'
                    : isActionLocked
                    ? 'text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40'
                    : 'text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                {isActionLocked ? (
                  <Lock className="size-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                ) : copiedType === 'jsx' ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
                <span>{copiedType === 'jsx' ? 'Copied JSX!' : 'Copy React JSX'}</span>
                {isIconLocked && (
                  <Lock className="size-3 text-amber-400/90 ml-1 shrink-0" />
                )}
              </button>
            </div>
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
                <span className="font-mono text-purple-400 font-bold">{localCustom.size}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="512"
                step="8"
                value={localCustom.size}
                onChange={(e) => setLocalCustom((prev) => ({ ...prev, size: Number(e.target.value) }))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex items-center justify-between gap-1 mt-2">
                {[24, 32, 48, 64, 128, 256, 512].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setLocalCustom((prev) => ({ ...prev, size: sz }))}
                    className={`px-2 py-1 text-[10px] font-mono font-medium rounded-lg border transition-all ${
                      localCustom.size === sz
                        ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
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
                    className={`size-6 rounded-lg border transition-transform ${localCustom.color === c ? 'border-white scale-110 shadow-md' : 'border-white/20 hover:scale-105'
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
                        className={`py-1 text-[11px] font-medium capitalize rounded-lg transition-colors ${localCustom.strokeLinecap === cap
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
                        className={`py-1 text-[11px] font-medium capitalize rounded-lg transition-colors ${localCustom.strokeLinejoin === join
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

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        reason={pricingReason}
        iconName={currentIcon?.name}
      />
    </>
  );
}
