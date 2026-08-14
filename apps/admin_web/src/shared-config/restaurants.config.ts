export const RESTAURANTS_QUERY_KEYS = {
  all: ['admin', 'restaurants'],
  detail: (id: string) => ['admin', 'restaurants', id],
} as const;

export const RESTAURANT_STATUS_COLOR_MAP: Record<string, string> = {
  PENDING: 'orange',
  APPROVED: 'green',
  SUSPENDED: 'red',
};

export const RESTAURANT_STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đang hoạt động' },
  { value: 'SUSPENDED', label: 'Bị đình chỉ' },
];
