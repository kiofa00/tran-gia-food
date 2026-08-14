import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QueryParams } from '@/services/apiClient';
import { payoutsService } from '@/services/payouts.service';
import { PAYOUTS_QUERY_KEYS } from '@/shared-config';

export function usePayoutsQuery(params?: QueryParams) {
  return useQuery({
    queryKey: [...PAYOUTS_QUERY_KEYS.all, params],
    queryFn: () => payoutsService.getPayouts(params),
  });
}

export function useProcessPayoutMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payoutId: string) => payoutsService.processPayout(payoutId),
    onSuccess: () => qc.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEYS.all }),
  });
}

export function useRejectPayoutMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ payoutId, reason }: { payoutId: string; reason: string }) =>
      payoutsService.rejectPayout(payoutId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEYS.all }),
  });
}
