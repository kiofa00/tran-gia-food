import { useQuery } from '@tanstack/react-query';
import { fleetService } from '../services/fleet.service';

import { QueryParams } from '../services/apiClient';

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
