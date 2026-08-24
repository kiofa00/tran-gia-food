import type { FilterOptionConfig } from './cms.config';

export const COMMISSION_QUERY_KEYS = {
  all: ['commissions', 'list'],
} as const;

export const COMMISSIONS_STATUS_FILTER_OPTIONS = [
  {
    value: 'ALL',
    label: 'Tất cả trạng thái',
    i18nKey: 'common.allStatus',
    defaultLabel: 'Tất cả trạng thái',
  },
  {
    value: 'PROCESSED',
    label: 'Đã Giải Ngân',
    i18nKey: 'commissions.statusProcessed',
    defaultLabel: 'Đã Giải Ngân',
  },
  {
    value: 'PENDING',
    label: 'Chờ Quyết Toán',
    i18nKey: 'commissions.statusPending',
    defaultLabel: 'Chờ Quyết Toán',
  },
] as const satisfies readonly FilterOptionConfig[];
