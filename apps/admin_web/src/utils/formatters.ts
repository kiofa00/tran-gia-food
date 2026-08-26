import dayjs from 'dayjs';

import { getLocale } from '@/hooks/useLocale';
import { DEFAULT_LOCALE } from '@/shared-config';

/**
 * Resolves a dynamic BCP 47 language tag based on the active locale (from CMS / user selection),
 * browser preferences, or falls back to system DEFAULT_LOCALE.
 */
export function resolveActiveLocale(customLocale?: string): string {
  if (customLocale) return customLocale;

  try {
    const localeFromHook = getLocale()?.locale;

    if (localeFromHook) return localeFromHook;

    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language;
    }
  } catch {
    // Ignore runtime context errors
  }

  return DEFAULT_LOCALE;
}

/** Format currency dynamically according to active locale (from CMS / user selection / browser) */
export function formatCurrency(amount: number, currency = 'VND', customLocale?: string): string {
  const targetLocale = resolveActiveLocale(customLocale);

  try {
    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

/** Format a number with comma thousand separators safely using Intl.NumberFormat without regex backtracking */
export function formatThousands(value: number | string | undefined): string {
  if (value === undefined || value === null || value === '') return '';
  const num = Number(value);

  if (Number.isNaN(num)) return String(value);

  return new Intl.NumberFormat('en-US').format(num);
}

/** Parse string with commas back to clean numeric string for InputNumber */
export function parseThousands(value: string | undefined): string {
  return value ? value.replace(/,/g, '') : '';
}

/** Format distance in kilometers (e.g. 2.456 -> 2.5 km) */
export function formatDistance(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km`;
}

/** Truncate long strings with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
}

/** Format ISO date string or timestamp to DD/MM/YYYY */
export function formatDate(dateStr: string | number | Date | undefined | null): string {
  if (!dateStr) return 'N/A';
  const parsed = dayjs(dateStr);

  if (!parsed.isValid()) return String(dateStr);

  return parsed.format('DD/MM/YYYY');
}

/** Format ISO date string or timestamp to DD/MM/YYYY HH:mm */
export function formatDateTime(
  dateStr: string | number | Date | undefined | null,
  format = 'DD/MM/YYYY HH:mm',
): string {
  if (!dateStr) return 'N/A';
  const parsed = dayjs(dateStr);

  if (!parsed.isValid()) return String(dateStr);

  return parsed.format(format);
}

export interface StatusMeta {
  label: string;
  badgeStatus: 'success' | 'warning' | 'error' | 'default' | 'processing';
  tagColor: string;
}

/** Map eKYC status keys to friendly semantic text & visual colors */
export function mapKycStatus(status: string): StatusMeta {
  const { t } = getLocale();

  switch (status?.toUpperCase()) {
    case 'PENDING':
      return {
        label: t('kyc.statusPending', 'Chờ duyệt eKYC'),
        badgeStatus: 'warning',
        tagColor: 'warning',
      };
    case 'APPROVED':
    case 'VERIFIED':
      return {
        label: t('kyc.statusVerified', 'Đã duyệt eKYC'),
        badgeStatus: 'success',
        tagColor: 'success',
      };
    case 'REJECTED':
      return {
        label: t('kyc.statusRejected', 'Đã từ chối'),
        badgeStatus: 'error',
        tagColor: 'error',
      };
    case 'UNVERIFIED':
      return {
        label: t('kyc.statusUnverified', 'Chưa xác thực'),
        badgeStatus: 'default',
        tagColor: 'default',
      };
    default:
      return {
        label: status || t('common.unknown', 'Không xác định'),
        badgeStatus: 'default',
        tagColor: 'default',
      };
  }
}

/** Map Shipper status keys to friendly semantic text & visual colors */
export function mapShipperStatus(status: string): StatusMeta {
  const { t } = getLocale();

  switch (status?.toUpperCase()) {
    case 'IDLE':
    case 'ONLINE':
      return {
        label: t('fleet.statusIdle', 'Đang sẵn sàng nhận đơn'),
        badgeStatus: 'success',
        tagColor: 'success',
      };
    case 'DELIVERING':
      return {
        label: t('fleet.statusDelivering', 'Đang giao hàng'),
        badgeStatus: 'warning',
        tagColor: 'warning',
      };
    case 'PICKING_UP':
      return {
        label: t('fleet.statusPickingUp', 'Đang đến lấy món'),
        badgeStatus: 'processing',
        tagColor: 'processing',
      };
    case 'PENDING_KYC':
      return {
        label: t('fleet.statusPendingKyc', 'Chờ duyệt eKYC'),
        badgeStatus: 'warning',
        tagColor: 'warning',
      };
    case 'OFFLINE':
      return {
        label: t('fleet.statusOffline', 'Đã tắt app / Offline'),
        badgeStatus: 'default',
        tagColor: 'default',
      };
    default:
      return {
        label: status || t('common.unknown', 'Không xác định'),
        badgeStatus: 'default',
        tagColor: 'default',
      };
  }
}

/** Map Order status keys to friendly semantic text & visual colors */
export function mapOrderStatus(status: string): StatusMeta {
  const { t } = getLocale();

  switch (status?.toUpperCase()) {
    case 'PENDING':
      return {
        label: t('orders.statusPending', 'Chờ quán xác nhận'),
        badgeStatus: 'warning',
        tagColor: 'warning',
      };
    case 'PREPARING':
      return {
        label: t('orders.statusPreparing', 'Quán đang chuẩn bị món'),
        badgeStatus: 'processing',
        tagColor: 'processing',
      };
    case 'PICKING_UP':
      return {
        label: t('orders.statusPickingUp', 'Tài xế đang lấy món'),
        badgeStatus: 'processing',
        tagColor: 'cyan',
      };
    case 'DELIVERING':
      return {
        label: t('orders.statusDelivering', 'Tài xế đang giao'),
        badgeStatus: 'warning',
        tagColor: 'orange',
      };
    case 'COMPLETED':
      return {
        label: t('orders.statusCompleted', 'Hoàn thành'),
        badgeStatus: 'success',
        tagColor: 'success',
      };
    case 'CANCELLED':
      return {
        label: t('orders.statusCancelled', 'Đã hủy đơn'),
        badgeStatus: 'error',
        tagColor: 'error',
      };
    default:
      return {
        label: status || t('common.unknown', 'Không xác định'),
        badgeStatus: 'default',
        tagColor: 'default',
      };
  }
}

/** Map vehicle type keys to friendly semantic text */
export function mapVehicleType(vehicle: string): string {
  const { t } = getLocale();

  switch (vehicle?.toUpperCase()) {
    case 'MOTORBIKE':
      return t('vehicles.motorbike', 'Xe máy');
    case 'ELECTRIC_BIKE':
      return t('vehicles.electricBike', 'Xe máy điện');
    case 'MOTORBIKE_50CC':
      return t('vehicles.motorbike50cc', 'Xe máy 50cc');
    case 'CAR':
      return t('vehicles.car', 'Ô tô');
    case 'BICYCLE':
      return t('vehicles.bicycle', 'Xe đạp');
    case 'TRUCK':
      return t('vehicles.truck', 'Xe tải');
    default:
      return vehicle || t('vehicles.motorbike', 'Xe máy');
  }
}

/** Get appropriate vehicle emoji/icon for vehicle type */
export function getVehicleIcon(vehicle: string): string {
  switch (vehicle?.toUpperCase()) {
    case 'CAR':
      return '🚗';
    case 'BICYCLE':
      return '🚲';
    case 'TRUCK':
      return '🚚';
    case 'MOTORBIKE':
    case 'ELECTRIC_BIKE':
    case 'MOTORBIKE_50CC':
    default:
      return '🛵';
  }
}
