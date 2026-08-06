import { useQuery } from '@tanstack/react-query';
import { commissionsService } from '../services/commissions.service';

export const COMMISSION_QUERY_KEYS = {
  all: ['commissions', 'list'],
};

export function useCommissionsQuery() {
  return useQuery({
    queryKey: COMMISSION_QUERY_KEYS.all,
    queryFn: commissionsService.getCommissions,
  });
}
