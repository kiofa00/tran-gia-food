import type { TranslationKey } from '@/lib/i18n';

export interface FilterOptionConfig {
  readonly value: string;
  readonly label: string;
  readonly i18nKey?: TranslationKey;
  readonly defaultLabel?: string;
}

export const CMS_QUERY_KEYS = {
  status: ['cms', 'data'],
} as const;

export const CMS_BANNER_STATUS_FILTER_OPTIONS = [
  {
    value: 'ALL',
    label: 'Tất Cả Banner',
    i18nKey: 'cms.allBanners',
    defaultLabel: 'Tất Cả Banner',
  },
  {
    value: 'ACTIVE',
    label: 'Đang Hiển Thị',
    i18nKey: 'cms.statusActive',
    defaultLabel: 'Đang Hiển Thị',
  },
  {
    value: 'INACTIVE',
    label: 'Tạm Dừng',
    i18nKey: 'cms.statusInactive',
    defaultLabel: 'Tạm Dừng',
  },
] as const satisfies readonly FilterOptionConfig[];

export const CMS_APP_TARGET_FILTER_OPTIONS = [
  {
    value: 'ALL',
    label: 'Tất Cả Ứng Dụng (ALL)',
    i18nKey: 'cms.allApps',
    defaultLabel: 'Tất Cả Ứng Dụng (ALL)',
  },
  {
    value: 'CUSTOMER',
    label: 'Customer App',
    i18nKey: 'cms.customerApp',
    defaultLabel: 'Customer App',
  },
  {
    value: 'SHIPPER',
    label: 'Shipper App',
    i18nKey: 'cms.shipperApp',
    defaultLabel: 'Shipper App',
  },
  {
    value: 'RESTAURANT',
    label: 'Restaurant App',
    i18nKey: 'cms.restaurantApp',
    defaultLabel: 'Restaurant App',
  },
  {
    value: 'ADMIN_WEB',
    label: 'Admin Web',
    i18nKey: 'cms.adminWebApp',
    defaultLabel: 'Admin Web',
  },
] as const satisfies readonly FilterOptionConfig[];

export const CMS_FAQ_TARGET_FILTER_OPTIONS = [
  {
    value: 'ALL',
    label: 'Tất Cả Ứng Dụng (ALL)',
    i18nKey: 'cms.allApps',
    defaultLabel: 'Tất Cả Ứng Dụng (ALL)',
  },
  {
    value: 'CUSTOMER',
    label: 'Customer App',
    i18nKey: 'cms.customerApp',
    defaultLabel: 'Customer App',
  },
  {
    value: 'SHIPPER',
    label: 'Shipper App',
    i18nKey: 'cms.shipperApp',
    defaultLabel: 'Shipper App',
  },
  {
    value: 'RESTAURANT',
    label: 'Restaurant App',
    i18nKey: 'cms.restaurantApp',
    defaultLabel: 'Restaurant App',
  },
] as const satisfies readonly FilterOptionConfig[];
