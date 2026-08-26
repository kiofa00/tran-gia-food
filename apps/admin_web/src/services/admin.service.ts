import { DashboardOverviewStats, ShipperKycItem } from '@/types';

import { apiClient } from './apiClient';

export const adminService = {
  getOverviewStats: async (): Promise<DashboardOverviewStats> => {
    const res = await apiClient.get<DashboardOverviewStats>('/admin/overview');

    return res.data;
  },

  getShipperKycList: async (
    params?: import('./apiClient').QueryParams,
  ): Promise<ShipperKycItem[] | Record<string, unknown>> => {
    const res = await apiClient.get('/admin/kyc/shippers', { params });

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

  getAppConfigs: async (): Promise<
    Array<{ id: string; key: string; value: string; description?: string }>
  > => {
    const res = await apiClient.get('/admin/config');

    return res.data;
  },

  setAppConfig: async (
    key: string,
    value: string,
  ): Promise<{ id: string; key: string; value: string; description?: string }> => {
    const res = await apiClient.patch('/admin/config', { key, value });

    return res.data;
  },
};
