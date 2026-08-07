import { useQuery } from '@tanstack/react-query';

import { cmsService } from '@/services/cms.service';

export const CMS_QUERY_KEYS = {
  status: ['cms', 'data'],
};

export function useCmsQuery() {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.status,
    queryFn: cmsService.getCmsData,
  });
}
