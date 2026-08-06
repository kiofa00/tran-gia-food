import { useQuery } from '@tanstack/react-query';
import { commissionsService } from '../services/commissions.service';

import { QueryParams } from '../services/apiClient';

export const COMMISSION_QUERY_KEYS = {
  all: ['commissions', 'list'],
};

export function useCommissionsQuery(params?: QueryParams) {
  return useQuery({
    queryKey: [...COMMISSION_QUERY_KEYS.all, params],
    queryFn: () => commissionsService.getCommissions(params),
  });
}
