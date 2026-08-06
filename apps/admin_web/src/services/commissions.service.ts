import { QueryParams, apiClient } from './apiClient';

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
  getCommissions: async (params?: QueryParams): Promise<Record<string, unknown>> => {
    const res = await apiClient.get('/admin/commissions', { params });

    return res.data;
  },
};
