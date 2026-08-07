export const CMS_QUERY_KEYS = {
  status: ['cms', 'data'],
} as const;

export const CMS_BANNER_STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất Cả Banner' },
  { value: 'ACTIVE', label: 'Đang Hiển Thị' },
  { value: 'INACTIVE', label: 'Tạm Dừng' },
];

export const CMS_APP_TARGET_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất Cả Ứng Dụng (ALL)' },
  { value: 'CUSTOMER', label: 'Customer App' },
  { value: 'SHIPPER', label: 'Shipper App' },
  { value: 'RESTAURANT', label: 'Restaurant App' },
  { value: 'ADMIN_WEB', label: 'Admin Web' },
];

export const CMS_FAQ_TARGET_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất Cả Ứng Dụng (ALL)' },
  { value: 'CUSTOMER', label: 'Customer App' },
  { value: 'SHIPPER', label: 'Shipper App' },
  { value: 'RESTAURANT', label: 'Restaurant App' },
];
