import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

export const ADMIN_QUERY_KEYS = {
  overview: ['admin', 'overview'],
  pendingShippers: ['admin', 'shippers', 'pending'],
};

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.overview,
    queryFn: adminService.getOverviewStats,
  });
}

export function usePendingShippersQuery() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.pendingShippers,
    queryFn: adminService.getPendingShippers,
  });
}

export function useVerifyShipperKycMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      adminService.verifyShipperKyc(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.pendingShippers });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    },
  });
}
