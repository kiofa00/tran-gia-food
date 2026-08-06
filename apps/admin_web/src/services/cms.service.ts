import axios from 'axios';

const cmsClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337',
  timeout: 5000,
});

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
}

export interface CmsStatusResponse {
  isOnline: boolean;
  banners: CmsBannerItem[];
  translations: CmsTranslationItem[];
}

export const cmsService = {
  getCmsData: async (): Promise<CmsStatusResponse> => {
    try {
      const [bannersRes, transRes] = await Promise.all([
        cmsClient.get('/api/banners'),
        cmsClient.get('/api/translations'),
      ]);
      return {
        isOnline: true,
        banners: bannersRes.data?.data || [],
        translations: transRes.data?.data || [],
      };
    } catch {
      return {
        isOnline: false,
        banners: [],
        translations: [],
      };
    }
  },
};
