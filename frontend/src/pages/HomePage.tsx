// frontend/src/pages/HomePage.tsx
import { useState, useEffect, useCallback } from 'react';
import SiteHeader from '@/components/header/SiteHeader';
import CategorySidebar from '@/components/sidebar/CategorySidebar';
import ControlsToolbar from '@/components/toolbar/ControlsToolbar';
import IconGrid from '@/components/grid/IconGrid';
import IconDetailDrawer from '@/components/drawer/IconDetailDrawer';
import AuthModal from '@/components/auth/AuthModal';
import AddToCollectionModal from '@/components/collections/AddToCollectionModal';
import { CategoryItem, IconItem } from '@/types/icon';
import { getCategories, getIcons } from '@/lib/api';
import { useIconCustomization } from '@/context/IconCustomizationContext';

export default function HomePage() {
  const { style } = useIconCustomization();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalIcons, setTotalIcons] = useState<number>(5148);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [icons, setIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalFiltered, setTotalFiltered] = useState<number>(0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null);
  const [collectionModalIcon, setCollectionModalIcon] = useState<IconItem | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Load categories on initial mount
  useEffect(() => {
    getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data.categories);
        setTotalIcons(res.data.total_icons);
      }
    });
  }, []);

  // Fetch icons
  const loadIcons = useCallback(
    async (isPageAppend = false, targetPage = 1) => {
      if (!isPageAppend) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await getIcons({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          style,
          search: searchQuery.trim() || undefined,
          page: targetPage,
          limit: 48,
        });

        if (res.success && res.data) {
          if (isPageAppend) {
            setIcons((prev) => [...prev, ...res.data!.icons]);
          } else {
            setIcons(res.data.icons);
          }
          setTotalPages(res.data.pagination.total_pages);
          setTotalFiltered(res.data.pagination.total);
          setPage(targetPage);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, style, searchQuery]
  );

  // Trigger fetch when category, style, or search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadIcons(false, 1);
    }, 150); // slight debounce for search input

    return () => clearTimeout(timer);
  }, [loadIcons]);

  // Load more icons (pagination/infinite)
  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      loadIcons(true, page + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0e15]">
      {/* Site Header */}
      <SiteHeader
        sidebarOpen={mobileSidebarOpen}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(slug) => {
              setSelectedCategory(slug);
            }}
            totalIcons={totalIcons}
          />
        </div>

        {/* Mobile Slide-over Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-50 w-72 h-full bg-[#12131d] shadow-2xl">
              <CategorySidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(slug) => {
                  setSelectedCategory(slug);
                  setMobileSidebarOpen(false);
                }}
                totalIcons={totalIcons}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)] overflow-hidden">
          {/* Top Controls Toolbar (Docked cleanly at top) */}
          <ControlsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalIconsFound={totalFiltered}
          />

          {/* Scrollable Icon Grid Container */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <IconGrid
              icons={icons}
              loading={loading}
              onSelectIcon={setSelectedIcon}
              hasMore={page < totalPages}
              onLoadMore={handleLoadMore}
              loadingMore={loadingMore}
            />
          </div>
        </main>
      </div>

      {/* Icon Detail Drawer */}
      <IconDetailDrawer
        icon={selectedIcon}
        onClose={() => setSelectedIcon(null)}
        onOpenAddToCollection={(icon) => {
          setCollectionModalIcon(icon);
        }}
        onSelectIcon={(icon) => setSelectedIcon(icon)}
      />

      {/* Add to Collection Modal */}
      <AddToCollectionModal
        icon={collectionModalIcon}
        onClose={() => setCollectionModalIcon(null)}
      />

      {/* Custom Auth Modal */}
      <AuthModal />
    </div>
  );
}
