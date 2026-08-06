export interface QueryOptions {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVoucherDto {
  code: string;
  type?: string;
  discountType?: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  totalLimit?: number;
  validFrom: string;
  validTo: string;
}

export interface RevenueTrendBucket {
  date: string;
  month: string;
  gmv: number;
  platformRevenue: number;
  shipperPayout: number;
  orders: number;
}

export interface AnalyticsSummary {
  totalGmv: number;
  platformRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  growthRate: number;
  comparisonLabel: string;
}

export interface PaymentSplitBucket {
  name: string;
  value: number;
  color: string;
}

export interface TopRestaurantRank {
  rank: number;
  name: string;
  orders: number;
  gmv: number;
  commission: number;
  rating: number;
}

export interface AnalyticsResponse {
  range: string;
  summary: AnalyticsSummary;
  revenueTrend: RevenueTrendBucket[];
  paymentSplit: PaymentSplitBucket[];
  topRestaurants: TopRestaurantRank[];
}
