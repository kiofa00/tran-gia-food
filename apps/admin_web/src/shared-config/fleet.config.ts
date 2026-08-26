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

export const FLEET_MAP_CONFIG = {
  defaultCenter: [10.7769, 106.7009] as [number, number],
  defaultZoom: 13,
  maxZoom: 19,
  fitBoundsMaxZoom: 15,
  fitBoundsPadding: [40, 40] as [number, number],
  tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileLayerAttribution: '© OpenStreetMap contributors',
  leafletCssUrl: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  leafletCssIntegrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',
  leafletJsUrl: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  leafletJsIntegrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=',
  markerColors: {
    active: '#16a34a',
    busy: '#ea580c',
    default: '#2563eb',
  },
} as const;
