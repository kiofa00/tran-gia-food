import { apiClient } from './apiClient';

export interface CmsBannerItem {
  id: string | number;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
}

export interface CmsTranslationItem {
  id: string | number;
  key: string;
  vi: string;
  en: string;
  appTarget?: string;
  category?: string;
}

export interface CmsFaqItem {
  id: string | number;
  question: string;
  answer: string;
  category?: string;
  targetApp?: string;
}

export interface CmsStatusResponse {
  isOnline: boolean;
  banners: CmsBannerItem[];
  translations: CmsTranslationItem[];
  faqs?: CmsFaqItem[];
}

export const cmsService = {
  getCmsData: async (): Promise<CmsStatusResponse> => {
    try {
      const res = await apiClient.get<CmsStatusResponse>('/cms/status');

      return res.data;
    } catch {
      return {
        isOnline: false,
        banners: [],
        translations: [],
        faqs: [],
      };
    }
  },
};
