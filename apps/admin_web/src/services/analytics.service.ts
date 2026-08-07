import { AnalyticsResponse } from '@/types';

import { apiClient } from './apiClient';

export const analyticsService = {
  getAnalyticsData: async (range?: string): Promise<AnalyticsResponse> => {
    const res = await apiClient.get<AnalyticsResponse>('/admin/analytics', {
      params: { range },
    });

    return res.data;
  },
};
