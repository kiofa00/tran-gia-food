import { apiClient } from './apiClient';

export interface DashboardOverviewStats {
  totalPlatformRevenue: number;
  totalFoodGmv: number;
  totalShipGmv: number;
  totalOrders: number;
  totalShippers: number;
  totalUsers?: number;
  totalRestaurants?: number;
}

export interface PendingShipperItem {
  id: string;
  vehicleType?: string;
  licensePlate?: string;
  kycStatus?: string;
  ekycStatus?: string;
  status?: string;
  name?: string;
  phone?: string;
  vehicle?: string;
  plate?: string;
  user?: {
    name: string;
    phone: string;
  };
}

export const adminService = {
  getOverviewStats: async (): Promise<DashboardOverviewStats> => {
    const res = await apiClient.get<DashboardOverviewStats>('/admin/overview');
    return res.data;
  },

  getPendingShippers: async (): Promise<PendingShipperItem[]> => {
    const res = await apiClient.get<PendingShipperItem[]>('/admin/shippers/pending-kyc');
    return res.data;
  },

  verifyShipperKyc: async (id: string, action: 'approve' | 'reject'): Promise<{ success: boolean; id: string; status: string }> => {
    const status = action === 'approve' ? 'VERIFIED' : 'REJECTED';
    const res = await apiClient.patch<{ success: boolean; id: string; status: string }>(`/admin/shippers/${id}/kyc`, { status });
    return res.data;
  },
};
