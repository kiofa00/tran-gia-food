import type { FilterOptionConfig } from './cms.config';

export const USERS_QUERY_KEYS = {
  all: ['admin', 'users'],
} as const;

export const ROLE_FILTER_RAW = [
  { value: 'ALL', label: 'Tất Cả', i18nKey: 'users.all', defaultLabel: 'Tất Cả' },
  {
    value: 'CUSTOMER',
    label: 'Khách Hàng',
    i18nKey: 'users.customers',
    defaultLabel: 'Khách Hàng',
  },
  {
    value: 'RESTAURANT_OWNER',
    label: 'Quán Ăn',
    i18nKey: 'users.restaurants',
    defaultLabel: 'Quán Ăn',
  },
  { value: 'SHIPPER', label: 'Shipper', i18nKey: 'users.shippers', defaultLabel: 'Shipper' },
  { value: 'ADMIN', label: 'Quản Trị Viên', i18nKey: 'users.admin', defaultLabel: 'Quản Trị Viên' },
] as const satisfies readonly FilterOptionConfig[];

export const STATUS_FILTER_RAW = [
  { value: 'ALL', label: 'Tất Cả', i18nKey: 'users.all', defaultLabel: 'Tất Cả' },
  { value: 'ACTIVE', label: 'Hoạt Động', i18nKey: 'users.active', defaultLabel: 'Hoạt Động' },
  { value: 'SUSPENDED', label: 'Tạm Khóa', i18nKey: 'users.suspended', defaultLabel: 'Tạm Khóa' },
] as const satisfies readonly FilterOptionConfig[];
