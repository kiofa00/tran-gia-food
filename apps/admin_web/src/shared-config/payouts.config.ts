import type { FilterOptionConfig } from './cms.config';

export const PAYOUTS_QUERY_KEYS = {
  all: ['admin', 'payouts'],
} as const;

export const PAYOUT_STATUS_COLOR_MAP = {
  PENDING: 'orange',
  PROCESSED: 'green',
  REJECTED: 'red',
} as const;

export const PAYOUT_STATUS_FILTER_OPTIONS = [
  {
    value: 'ALL',
    label: 'Tất cả trạng thái',
    i18nKey: 'common.allStatus',
    defaultLabel: 'Tất cả trạng thái',
  },
  {
    value: 'PENDING',
    label: 'Chờ giải ngân',
    i18nKey: 'payouts.statusPending',
    defaultLabel: 'Chờ giải ngân',
  },
  {
    value: 'PROCESSED',
    label: 'Đã giải ngân',
    i18nKey: 'payouts.statusCompleted',
    defaultLabel: 'Đã giải ngân',
  },
  {
    value: 'REJECTED',
    label: 'Bị từ chối',
    i18nKey: 'payouts.statusFailed',
    defaultLabel: 'Bị từ chối',
  },
] as const satisfies readonly FilterOptionConfig[];
