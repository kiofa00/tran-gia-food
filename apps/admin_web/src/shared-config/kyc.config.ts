import type { FilterOptionConfig } from './cms.config';

export const KYC_QUERY_KEYS = {
  all: ['admin', 'kyc'],
} as const;

export const KYC_STATUS_FILTER_OPTIONS = [
  {
    value: 'ALL',
    label: 'Tất cả trạng thái',
    i18nKey: 'common.allStatus',
    defaultLabel: 'Tất cả trạng thái',
  },
  {
    value: 'PENDING',
    label: 'Chờ duyệt eKYC',
    i18nKey: 'kyc.tabPending',
    defaultLabel: 'Chờ duyệt eKYC',
  },
  {
    value: 'APPROVED',
    label: 'Đã duyệt eKYC',
    i18nKey: 'kyc.tabVerified',
    defaultLabel: 'Đã duyệt eKYC',
  },
  {
    value: 'REJECTED',
    label: 'Từ chối',
    i18nKey: 'kyc.tabRejected',
    defaultLabel: 'Từ chối',
  },
] as const satisfies readonly FilterOptionConfig[];
