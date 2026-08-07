import { useMemo } from 'react';

import { useTranslation } from '@/providers/LanguageProvider';
import { getRoleFilterOptions, getStatusFilterOptions } from '@/utils';

export const useUserFilterOptions = () => {
  const { t } = useTranslation();

  const roleFilterOptions = useMemo(() => getRoleFilterOptions(t), [t]);
  const statusFilterOptions = useMemo(() => getStatusFilterOptions(t), [t]);

  return { roleFilterOptions, statusFilterOptions };
};
