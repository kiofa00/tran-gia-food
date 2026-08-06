import { apiClient } from './apiClient';

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

export const vouchersService = {
  getVouchers: async (): Promise<VoucherItem[]> => {
    const res = await apiClient.get<VoucherItem[]>('/admin/vouchers');
    return res.data;
  },

  createVoucher: async (payload: CreateVoucherPayload): Promise<VoucherItem> => {
    const res = await apiClient.post<VoucherItem>('/admin/vouchers', payload);
    return res.data;
  },
};
