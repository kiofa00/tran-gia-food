import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QueryParams } from '@/services/apiClient';
import { restaurantsService } from '@/services/restaurants.service';
import { RESTAURANTS_QUERY_KEYS } from '@/shared-config';

export function useRestaurantsQuery(params?: QueryParams) {
  return useQuery({
    queryKey: [...RESTAURANTS_QUERY_KEYS.all, params],
    queryFn: () => restaurantsService.getRestaurants(params),
  });
}

export function useApproveRestaurantMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restaurantsService.approveRestaurant(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESTAURANTS_QUERY_KEYS.all }),
  });
}

export function useSuspendRestaurantMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      restaurantsService.suspendRestaurant(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESTAURANTS_QUERY_KEYS.all }),
  });
}
