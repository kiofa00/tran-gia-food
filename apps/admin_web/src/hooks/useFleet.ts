import { useQuery } from '@tanstack/react-query';

import { QueryParams } from '@/services/apiClient';
import { fleetService } from '@/services/fleet.service';

export const FLEET_QUERY_KEYS = {
  all: ['fleet', 'shippers'],
};

export function useFleetQuery(params?: QueryParams) {
  return useQuery({
    queryKey: [...FLEET_QUERY_KEYS.all, params],
    queryFn: () => fleetService.getFleetShippers(params),
    refetchInterval: 15000, // Auto-refresh fleet coordinates every 15s
  });
}
