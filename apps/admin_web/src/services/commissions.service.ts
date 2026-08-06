import { apiClient } from './apiClient';

export interface CommissionItem {
  id: string;
  orderId: string;
  customerName: string;
  restaurantName: string;
  totalFoodGmv: number;
  shipFee: number;
  restaurantShare: number;
  shipperShare: number;
  platformCommission: number;
  createdAt: string;
  status: string;
}

export const commissionsService = {
  getCommissions: async (): Promise<CommissionItem[]> => {
    const res = await apiClient.get<CommissionItem[]>('/admin/commissions');
    return res.data;
  },
};
