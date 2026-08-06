import dayjs from 'dayjs';

export interface DashboardStats {
  totalPlatformRevenue: number;
  totalFoodGmv: number;
  totalShipGmv: number;
  totalOrders: number;
  totalShippers: number;
  totalUsers?: number;
  totalRestaurants?: number;
}

export interface PendingShipperRecord {
  key: string;
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  status: string;
  rawStatus: string;
}

export interface VoucherRecord {
  key: string;
  code: string;
  type: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  validFrom: string;
  validTo: string;
  usedCount: number;
  totalLimit: number;
  isActive: boolean;
}

export interface CreateVoucherFormValues {
  code: string;
  type?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  totalLimit?: number;
  validDates?: [dayjs.Dayjs, dayjs.Dayjs];
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
}

export interface BannerRecord {
  title: string;
  target?: string;
  status?: string;
  updated?: string;
  isActive?: boolean;
}

export interface TranslationRecord {
  key: string;
  locale?: string;
  app?: string;
  value?: string;
  vi?: string;
  en?: string;
}
