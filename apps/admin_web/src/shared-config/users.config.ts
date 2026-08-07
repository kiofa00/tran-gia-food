export const USERS_QUERY_KEYS = {
  all: ['admin', 'users'],
} as const;

export const ROLE_FILTER_RAW = [
  { value: 'ALL', i18nKey: 'users.all', defaultLabel: 'Tất Cả' },
  { value: 'CUSTOMER', i18nKey: 'users.customers', defaultLabel: 'Khách Hàng' },
  { value: 'RESTAURANT_OWNER', i18nKey: 'users.restaurants', defaultLabel: 'Quán Ăn' },
  { value: 'SHIPPER', i18nKey: 'users.shippers', defaultLabel: 'Shipper' },
  { value: 'ADMIN', i18nKey: 'users.admin', defaultLabel: 'Quản Trị Viên' },
] as const;

export const STATUS_FILTER_RAW = [
  { value: 'ALL', i18nKey: 'users.all', defaultLabel: 'Tất Cả' },
  { value: 'ACTIVE', i18nKey: 'users.active', defaultLabel: 'Hoạt Động' },
  { value: 'SUSPENDED', i18nKey: 'users.suspended', defaultLabel: 'Tạm Khóa' },
] as const;
