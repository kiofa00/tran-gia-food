export const COMMISSION_QUERY_KEYS = {
  all: ['commissions', 'list'],
} as const;

export const COMMISSIONS_STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PROCESSED', label: 'Đã Giải Ngân' },
  { value: 'PENDING', label: 'Chờ Quyết Toán' },
];
