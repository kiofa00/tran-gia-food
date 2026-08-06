import { apiClient } from './apiClient';

export interface RevenueTrendItem {
  date: string;
  month?: string;
  gmv: number;
  platformRevenue: number;
  orders: number;
}

export interface PaymentMethodItem {
  name: string;
  value: number;
  color: string;
}

export interface TopRestaurantItem {
  id?: string;
  rank: number;
  name: string;
  ordersCount: number;
  revenue: number;
}

export interface AnalyticsResponse {
  revenueTrend?: RevenueTrendItem[];
  paymentMethods?: PaymentMethodItem[];
  topRestaurants?: TopRestaurantItem[];
}

export const analyticsService = {
  getAnalyticsData: async (): Promise<AnalyticsResponse> => {
    const res = await apiClient.get<AnalyticsResponse>('/admin/analytics');
    return res.data;
  },
};
