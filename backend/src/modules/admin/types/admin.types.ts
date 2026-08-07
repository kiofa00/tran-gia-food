export interface QueryOptions {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QueryUserOptions extends QueryOptions {
  role?: string;
  userStatus?: string;
}

export interface UserRow {
  id: string;
  key: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  status: string;
  createdAt: Date | string;
  [key: string]: unknown;
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

/** Named row type for Voucher admin table (Prisma Voucher + Ant Design key field) */
export interface VoucherRow {
  id: string;
  key: string;
  code: string;
  type: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  totalLimit: number | null;
  usedCount: number;
  validFrom: Date | string;
  validTo: Date | string;
  isActive?: boolean;
  // Allow Prisma extra fields (createdAt, issuedById, etc.)
  [key: string]: unknown;
}

/** Named row type for Commission admin table — mirrors Prisma Commission + createdAt fallback used in analytics */
export interface CommissionRow {
  id: string;
  key: string;
  orderId: string;
  foodAmount: number;
  shipAmount: number;
  restaurantShare: number;
  shipperShare: number;
  platformShare: number;
  processedAt: Date | null;
  // Allow fallback date field used in revenue trend filtering
  createdAt?: Date | string;
}

/** Named row type for Shipper fleet table */
export interface ShipperRow {
  id: string;
  key: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  lat: number;
  lng: number;
  status: string;
  ekycStatus: string;
  isActive?: boolean;
  rating?: number;
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
