import { DashboardOverviewStats, PendingShipperItem } from '@/types';

import { apiClient } from './apiClient';

export const adminService = {
  getOverviewStats: async (): Promise<DashboardOverviewStats> => {
    const res = await apiClient.get<DashboardOverviewStats>('/admin/overview');

    return res.data;
  },

  getPendingShippers: async (
    params?: import('./apiClient').QueryParams,
  ): Promise<PendingShipperItem[] | Record<string, unknown>> => {
    const res = await apiClient.get('/admin/shippers/pending-kyc', { params });

    return res.data;
  },

  verifyShipperKyc: async (
    id: string,
    action: 'approve' | 'reject',
  ): Promise<{ success: boolean; id: string; status: string }> => {
    const status = action === 'approve' ? 'VERIFIED' : 'REJECTED';
    const res = await apiClient.patch<{ success: boolean; id: string; status: string }>(
      `/admin/shippers/${id}/kyc`,
      { status },
    );

    return res.data;
  },
};
