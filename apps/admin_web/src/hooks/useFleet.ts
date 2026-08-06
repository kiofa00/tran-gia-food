import { useQuery } from '@tanstack/react-query';
import { fleetService } from '../services/fleet.service';

export const FLEET_QUERY_KEYS = {
  all: ['fleet', 'shippers'],
};

export function useFleetQuery() {
  return useQuery({
    queryKey: FLEET_QUERY_KEYS.all,
    queryFn: fleetService.getFleetShippers,
    refetchInterval: 15000, // Auto-refresh fleet coordinates every 15s
  });
}
