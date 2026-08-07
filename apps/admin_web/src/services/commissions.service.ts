import { QueryParams, apiClient } from './apiClient';

export const commissionsService = {
  getCommissions: async (params?: QueryParams): Promise<Record<string, unknown>> => {
    const res = await apiClient.get('/admin/commissions', { params });

    return res.data;
  },
};
