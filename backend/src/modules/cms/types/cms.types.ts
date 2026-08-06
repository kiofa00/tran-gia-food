export interface CmsBanner {
  id: string | number;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  targetAudience?: string;
  isActive?: boolean;
}

export interface CmsTranslation {
  id: string | number;
  key: string;
  vi: string;
  en: string;
  appTarget?: string;
  category?: string;
}

export interface CmsAnnouncement {
  id: string | number;
  title: string;
  summary?: string;
  content?: string;
  priority?: string;
  publishedAt?: string;
}

export interface CmsFaq {
  id: string | number;
  category?: string;
  question: string;
  answer: string;
  targetApp?: string;
}

export interface CmsStatusResponse {
  isOnline: boolean;
  source: 'strapi_live' | 'redis_cache' | 'empty';
  bannersCount: number;
  translationsCount: number;
  faqsCount: number;
  banners: CmsBanner[];
  translations: CmsTranslation[];
  faqs: CmsFaq[];
}
