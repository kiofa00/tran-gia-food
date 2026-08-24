import type { FilterOptionConfig } from './cms.config';

export const FLEET_QUERY_KEYS = {
  all: ['fleet', 'shippers'],
} as const;

export const FLEET_STATUS_COLOR_MAP = {
  DELIVERING: 'orange',
  IDLE: 'green',
} as const;

export const FLEET_STATUS_FILTER_OPTIONS = [
  {
    value: 'ALL',
    label: 'Tất cả trạng thái',
    i18nKey: 'common.allStatus',
    defaultLabel: 'Tất cả trạng thái',
  },
  {
    value: 'DELIVERING',
    label: 'Đang giao hàng',
    i18nKey: 'fleet.statusDelivering',
    defaultLabel: 'Đang giao hàng',
  },
  {
    value: 'IDLE',
    label: 'Đang sẵn sàng nhận đơn',
    i18nKey: 'fleet.statusIdle',
    defaultLabel: 'Đang sẵn sàng nhận đơn',
  },
  { value: 'OFFLINE', label: 'Offline', i18nKey: 'fleet.statusOffline', defaultLabel: 'Offline' },
] as const satisfies readonly FilterOptionConfig[];
