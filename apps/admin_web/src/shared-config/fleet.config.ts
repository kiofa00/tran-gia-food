export const FLEET_QUERY_KEYS = {
  all: ['fleet', 'shippers'],
} as const;

export const FLEET_STATUS_COLOR_MAP: Record<string, string> = {
  DELIVERING: 'orange',
  IDLE: 'green',
};

export const FLEET_STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'DELIVERING', label: 'Đang giao hàng' },
  { value: 'IDLE', label: 'Đang sẵn sàng nhận đơn' },
  { value: 'OFFLINE', label: 'Offline' },
];
