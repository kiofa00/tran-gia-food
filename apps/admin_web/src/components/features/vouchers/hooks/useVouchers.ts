import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QueryParams } from '@/services/apiClient';
import { vouchersService } from '@/services/vouchers.service';
import { VOUCHER_QUERY_KEYS } from '@/shared-config';
import { CreateVoucherPayload } from '@/types';

export function useVouchersQuery(params?: QueryParams) {
  return useQuery({
    queryKey: [...VOUCHER_QUERY_KEYS.all, params],
    queryFn: () => vouchersService.getVouchers(params),
  });
}

export function useCreateVoucherMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVoucherPayload) => vouchersService.createVoucher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOUCHER_QUERY_KEYS.all });
    },
  });
}

export function useToggleVoucherMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      vouchersService.toggleVoucher(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOUCHER_QUERY_KEYS.all });
    },
  });
}
