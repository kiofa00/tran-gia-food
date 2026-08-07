import dayjs from 'dayjs';

export interface VoucherRecord {
  key: string;
  id: string;
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
