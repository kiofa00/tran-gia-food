import { useQuery } from '@tanstack/react-query';

import { cmsService } from '@/services/cms.service';
import { CMS_QUERY_KEYS } from '@/shared-config';

export function useCmsQuery() {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.status,
    queryFn: cmsService.getCmsData,
  });
}
