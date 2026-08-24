import type { FilterOptionConfig } from './cms.config';

export const VOUCHER_QUERY_KEYS = {
  all: ['vouchers', 'list'],
} as const;

export const VOUCHER_STATUS_FILTER_OPTIONS = [
  {
    value: 'ALL',
    label: 'Tất cả trạng thái',
    i18nKey: 'common.allStatus',
    defaultLabel: 'Tất cả trạng thái',
  },
  {
    value: 'ACTIVE',
    label: 'Đang diễn ra',
    i18nKey: 'vouchers.statusActive',
    defaultLabel: 'Đang diễn ra',
  },
  {
    value: 'INACTIVE',
    label: 'Tạm dừng',
    i18nKey: 'vouchers.statusInactive',
    defaultLabel: 'Tạm dừng',
  },
] as const satisfies readonly FilterOptionConfig[];
