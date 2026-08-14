export const PAYOUTS_QUERY_KEYS = {
  all: ['admin', 'payouts'],
} as const;

export const PAYOUT_STATUS_COLOR_MAP: Record<string, string> = {
  PENDING: 'orange',
  PROCESSED: 'green',
  REJECTED: 'red',
};

export const PAYOUT_STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ giải ngân' },
  { value: 'PROCESSED', label: 'Đã giải ngân' },
  { value: 'REJECTED', label: 'Bị từ chối' },
];
