import { CmsStatusResponse } from '@/types';

import { apiClient } from './apiClient';

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
