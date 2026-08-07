import { useQuery } from '@tanstack/react-query';

import { QueryParams } from '@/services/apiClient';
import { commissionsService } from '@/services/commissions.service';

export const COMMISSION_QUERY_KEYS = {
  all: ['commissions', 'list'],
};

export function useCommissionsQuery(params?: QueryParams) {
  return useQuery({
    queryKey: [...COMMISSION_QUERY_KEYS.all, params],
    queryFn: () => commissionsService.getCommissions(params),
  });
}
