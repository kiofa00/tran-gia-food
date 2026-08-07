export const ADMIN_QUERY_KEYS = {
  overview: ['admin', 'overview'],
  pendingShippers: ['admin', 'shippers', 'pending'],
} as const;

export const DASHBOARD_SHIPPER_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ duyệt eKYC' },
  { value: 'APPROVED', label: 'Đã duyệt eKYC' },
  { value: 'REJECTED', label: 'Từ chối' },
];
