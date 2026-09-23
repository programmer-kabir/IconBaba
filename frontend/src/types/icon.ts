// frontend/types/icon.ts

export type IconStyle = 'outlined' | 'filled';

export type StrokeLinecap = 'round' | 'butt' | 'square';
export type StrokeLinejoin = 'round' | 'bevel' | 'miter';

export type IconTier = 'all' | 'free' | 'pro';

export interface IconItem {
  id: number;
  name: string;
  slug: string;
  category: string;
  category_slug: string;
  tags: string[];
  downloads_count: number;
  favorites_count: number;
  style: IconStyle;
  is_premium?: boolean;
  svg: string;
  v_data?: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon_count: number;
}

export interface IconCustomization {
  size: number;
  color: string;
  strokeWidth: number;
  strokeLinecap: StrokeLinecap;
  strokeLinejoin: StrokeLinejoin;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: string;
  roles?: string[];
  stats?: {
    favorites_count: number;
    collections_count: number;
    downloads_count: number;
  };
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  items_count: number;
  is_owner?: boolean;
  created_at: string;
  updated_at: string;
  items?: IconItem[];
}

export interface DownloadHistoryItem {
  download_id: number;
  format: 'svg' | 'png';
  size: number;
  downloaded_at: string;
  icon: IconItem;
}

export interface QuotaStatus {
  plan: 'guest' | 'free' | 'pro';
  is_unlimited: boolean;
  used: number;
  limit: number | null;
  remaining: number;
  can_export: boolean;
  require_login: boolean;
  require_pro: boolean;
}

