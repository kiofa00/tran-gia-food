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

export interface CmsBannerItem {
  id: string | number;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
}

export interface CmsTranslationItem {
  id: string | number;
  key: string;
  appTarget?: string;
  category?: string;
  [langKey: string]: unknown;
}

export interface CmsFaqItem {
  id: string | number;
  question: string;
  answer: string;
  category?: string;
  targetApp?: string;
}

export interface CmsStatusResponse {
  isOnline: boolean;
  banners: CmsBannerItem[];
  translations: CmsTranslationItem[];
  faqs?: CmsFaqItem[];
}

export interface VoucherItem {
  id: string;
  code: string;
  type: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  usageCount: number;
  totalLimit: number;
  validFrom: string;
  validTo: string;
  status: string;
}

export interface CreateVoucherPayload {
  code: string;
  type: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  totalLimit: number;
  validFrom: string;
  validTo: string;
}

export interface CommissionRecord {
  key: string;
  orderId: string;
  restaurantName: string;
  foodAmount: number;
  shipAmount: number;
  restaurantShare: number;
  shipperShare: number;
  platformShare: number;
  status: 'PROCESSED' | 'PENDING';
  createdAt: string;
}

export interface ShipperRecord {
  key: string;
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  lat: number;
  lng: number;
  status: string;
  ekycStatus?: string;
  rating?: number;
}
