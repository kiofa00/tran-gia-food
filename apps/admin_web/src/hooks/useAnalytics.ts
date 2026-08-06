import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

export const ANALYTICS_QUERY_KEYS = {
  data: ['analytics', 'data'],
};

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.data,
    queryFn: analyticsService.getAnalyticsData,
  });
}
