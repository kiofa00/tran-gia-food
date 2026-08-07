import { CreateVoucherPayload, VoucherItem } from '@/types';

import { QueryParams, apiClient } from './apiClient';

export const vouchersService = {
  getVouchers: async (params?: QueryParams): Promise<Record<string, unknown>> => {
    const res = await apiClient.get('/admin/vouchers', { params });

    return res.data;
  },

  createVoucher: async (payload: CreateVoucherPayload): Promise<VoucherItem> => {
    const res = await apiClient.post<VoucherItem>('/admin/vouchers', payload);

    return res.data;
  },

  toggleVoucher: async (id: string, isActive: boolean): Promise<Record<string, unknown>> => {
    const res = await apiClient.patch(`/admin/vouchers/${id}/toggle`, { isActive });

    return res.data;
  },
};
