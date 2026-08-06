import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vouchersService, CreateVoucherPayload } from '../services/vouchers.service';

export const VOUCHER_QUERY_KEYS = {
  all: ['vouchers', 'list'],
};

export function useVouchersQuery() {
  return useQuery({
    queryKey: VOUCHER_QUERY_KEYS.all,
    queryFn: vouchersService.getVouchers,
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
