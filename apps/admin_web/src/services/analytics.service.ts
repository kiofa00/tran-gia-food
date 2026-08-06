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

export interface AnalyticsSummary {
  totalGmv: number;
  platformRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  growthRate: number;
  comparisonLabel: string;
}

export interface AnalyticsResponse {
  range?: string;
  summary?: AnalyticsSummary;
  revenueTrend?: RevenueTrendItem[];
  paymentMethods?: PaymentMethodItem[];
  paymentSplit?: PaymentMethodItem[];
  topRestaurants?: TopRestaurantItem[];
}

export const analyticsService = {
  getAnalyticsData: async (range?: string): Promise<AnalyticsResponse> => {
    const res = await apiClient.get<AnalyticsResponse>('/admin/analytics', {
      params: { range },
    });

    return res.data;
  },
};
