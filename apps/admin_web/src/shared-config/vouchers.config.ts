export const VOUCHER_QUERY_KEYS = {
  all: ['vouchers', 'list'],
} as const;

export const VOUCHER_STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang diễn ra' },
  { value: 'INACTIVE', label: 'Tạm dừng' },
];
