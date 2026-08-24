import type { FilterOptionConfig } from './cms.config';

export const RESTAURANTS_QUERY_KEYS = {
  all: ['admin', 'restaurants'],
  detail: (id: string) => ['admin', 'restaurants', id],
} as const;

export const RESTAURANT_STATUS_COLOR_MAP = {
  PENDING: 'orange',
  APPROVED: 'green',
  SUSPENDED: 'red',
} as const;

export const RESTAURANT_STATUS_FILTER_OPTIONS = [
  {
    value: 'ALL',
    label: 'Tất cả trạng thái',
    i18nKey: 'common.allStatus',
    defaultLabel: 'Tất cả trạng thái',
  },
  {
    value: 'PENDING',
    label: 'Chờ duyệt',
    i18nKey: 'restaurants.statusPending',
    defaultLabel: 'Chờ duyệt',
  },
  {
    value: 'APPROVED',
    label: 'Đang hoạt động',
    i18nKey: 'restaurants.statusApproved',
    defaultLabel: 'Đang hoạt động',
  },
  {
    value: 'SUSPENDED',
    label: 'Bị đình chỉ',
    i18nKey: 'restaurants.statusSuspended',
    defaultLabel: 'Bị đình chỉ',
  },
] as const satisfies readonly FilterOptionConfig[];
