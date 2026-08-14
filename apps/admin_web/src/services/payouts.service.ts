import { QueryParams, apiClient } from './apiClient';

export const payoutsService = {
  getPayouts: async (params?: QueryParams) => {
    const res = await apiClient.get('/admin/payouts', { params });

    return res.data;
  },
  processPayout: async (payoutId: string) => {
    const res = await apiClient.patch(`/admin/payouts/${payoutId}/process`, {});

    return res.data;
  },
  rejectPayout: async (payoutId: string, reason: string) => {
    const res = await apiClient.patch(`/admin/payouts/${payoutId}/reject`, { reason });

    return res.data;
  },
};
