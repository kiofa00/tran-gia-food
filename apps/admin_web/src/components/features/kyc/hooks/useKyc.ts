import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QueryParams } from '@/services/apiClient';
import { kycService } from '@/services/kyc.service';
import { ADMIN_QUERY_KEYS, KYC_QUERY_KEYS } from '@/shared-config';

export function useKycQuery(params?: QueryParams) {
  return useQuery({
    queryKey: [...KYC_QUERY_KEYS.all, params],
    queryFn: () => kycService.getKycApplications(params),
  });
}

export function useApproveKycMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kycService.approveKyc(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KYC_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    },
  });
}

export function useRejectKycMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      kycService.rejectKyc(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KYC_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    },
  });
}
