import { useMemo } from 'react';

import { useLocale } from '@/hooks/useLocale';
import { getRoleFilterOptions, getStatusFilterOptions } from '@/utils';

export const useUserFilterOptions = () => {
  const { t } = useLocale();

  const roleFilterOptions = useMemo(() => getRoleFilterOptions(t), [t]);
  const statusFilterOptions = useMemo(() => getStatusFilterOptions(t), [t]);

  return { roleFilterOptions, statusFilterOptions };
};
