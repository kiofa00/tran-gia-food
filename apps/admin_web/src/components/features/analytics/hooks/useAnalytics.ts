import { useQuery } from '@tanstack/react-query';

import { analyticsService } from '@/services/analytics.service';
import { ANALYTICS_QUERY_KEYS } from '@/shared-config';

export function useAnalyticsQuery(range?: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.data, range],
    queryFn: () => analyticsService.getAnalyticsData(range),
  });
}
