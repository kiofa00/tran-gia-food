import type { FilterOptionConfig } from './cms.config';

export const ANALYTICS_QUERY_KEYS = {
  data: ['analytics', 'data'],
} as const;

export const ANALYTICS_TIME_RANGE_OPTIONS = [
  { value: '7d', label: '7 ngày qua', i18nKey: 'analytics.range7d', defaultLabel: '7 ngày qua' },
  {
    value: '30d',
    label: '30 ngày qua',
    i18nKey: 'analytics.range30d',
    defaultLabel: '30 ngày qua',
  },
  {
    value: 'quarter',
    label: 'Quý này',
    i18nKey: 'analytics.rangeQuarter',
    defaultLabel: 'Quý này',
  },
] as const satisfies readonly FilterOptionConfig[];
