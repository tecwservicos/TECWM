export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface UserStats {
  manualsViewed: number;
  downloadsCount: number;
  favoritesCount: number;
  readingTimeMinutes: number; // in minutes
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  isPremium: boolean;
  premiumUntil: string | null; // ISO string
  stats: UserStats;
  avatarUrl: string;
}

export interface Manual {
  id: string;
  title: string;
  brand: string;
  model: string;
  category: string;
  description: string;
  keywords: string[];
  coverImage: string;
  pdfUrl: string; // fallback mock link or pdf placeholder data
  premium: boolean;
  views: number;
  downloads: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
  pages: number;
  fileSize: string;
  compatibleEquipment: string[];
  publicationDate: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string; // Lucide icon name
  color: string; // Tailwind bg/text class
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  manualCount: number;
}

export interface FavoriteFolder {
  id: string;
  name: string;
  manualIds: string[];
  createdAt: string;
}

export interface ReadingHistoryItem {
  id: string;
  manualId: string;
  lastReadAt: string;
  progressPercent: number;
  lastPage: number;
}

export interface DownloadedManual {
  id: string;
  manualId: string;
  downloadedAt: string;
  localPath: string; // Simulated file system path
  fileSize: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  type: 'new_manual' | 'promo' | 'system';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}
