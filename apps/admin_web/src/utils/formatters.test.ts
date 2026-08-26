import { describe, expect, it } from 'vitest';

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDistance,
  formatThousands,
  mapKycStatus,
  mapOrderStatus,
  mapShipperStatus,
  mapVehicleType,
  parseThousands,
  truncateText,
} from './formatters';

describe('formatters utility', () => {
  it('should format numbers with comma thousand separators safely', () => {
    expect(formatThousands(15000)).toBe('15,000');
    expect(formatThousands('15000')).toBe('15,000');
    expect(formatThousands(1000000)).toBe('1,000,000');
    expect(formatThousands(0)).toBe('0');
    expect(formatThousands('')).toBe('');
    expect(formatThousands(undefined)).toBe('');
  });

  it('should parse formatted string with commas back to raw string', () => {
    expect(parseThousands('15,000')).toBe('15000');
    expect(parseThousands('1,000,000')).toBe('1000000');
    expect(parseThousands('')).toBe('');
    expect(parseThousands(undefined)).toBe('');
  });

  it('should format currency correctly', () => {
    const formatted = formatCurrency(50000);

    expect(formatted).toContain('50');
    expect(formatted).toContain('₫');
  });

  it('should format distance to 1 decimal place with km unit', () => {
    expect(formatDistance(2.456)).toBe('2.5 km');
    expect(formatDistance(10)).toBe('10.0 km');
  });

  it('should truncate text longer than max length', () => {
    expect(truncateText('Phở Bò Hà Nội Gia Truyền', 10)).toBe('Phở Bò Hà ...');
    expect(truncateText('Phở Bò', 10)).toBe('Phở Bò');
  });

  it('should format ISO date strings to DD/MM/YYYY', () => {
    expect(formatDate('2026-08-01T00:00:00.000Z')).toBe('01/08/2026');
    expect(formatDate('2026-08-31')).toBe('31/08/2026');
    expect(formatDate(null)).toBe('N/A');
    expect(formatDate(undefined)).toBe('N/A');
    expect(formatDate('invalid-date')).toBe('invalid-date');
  });

  it('should format ISO date strings to DD/MM/YYYY HH:mm', () => {
    expect(formatDateTime('2026-08-19T08:58:46.220Z')).toMatch(/\d{2}\/08\/2026 \d{2}:\d{2}/);
    expect(formatDateTime(null)).toBe('N/A');
    expect(formatDateTime(undefined)).toBe('N/A');
    expect(formatDateTime('invalid-date')).toBe('invalid-date');
  });

  it('should map eKYC status to semantic Vietnamese text and badge color', () => {
    expect(mapKycStatus('PENDING').label).toBe('Chờ duyệt eKYC');
    expect(mapKycStatus('APPROVED').label).toBe('Đã duyệt eKYC');
    expect(mapKycStatus('REJECTED').label).toBe('Đã từ chối');
  });

  it('should map Shipper status to semantic Vietnamese text', () => {
    expect(mapShipperStatus('IDLE').label).toBe('Đang sẵn sàng nhận đơn');
    expect(mapShipperStatus('DELIVERING').label).toBe('Đang giao hàng');
    expect(mapShipperStatus('PICKING_UP').label).toBe('Đang đến lấy món');
    expect(mapShipperStatus('OFFLINE').label).toBe('Đã tắt app / Offline');
  });

  it('should map Order status to semantic Vietnamese text', () => {
    expect(mapOrderStatus('PENDING').label).toBe('Chờ quán xác nhận');
    expect(mapOrderStatus('PREPARING').label).toBe('Quán đang chuẩn bị món');
    expect(mapOrderStatus('DELIVERING').label).toBe('Tài xế đang giao');
    expect(mapOrderStatus('COMPLETED').label).toBe('Hoàn thành');
  });

  it('should map vehicle type keys to friendly semantic text', () => {
    expect(mapVehicleType('MOTORBIKE')).toBe('Xe máy');
    expect(mapVehicleType('ELECTRIC_BIKE')).toBe('Xe máy điện');
    expect(mapVehicleType('MOTORBIKE_50CC')).toBe('Xe máy 50cc');
    expect(mapVehicleType('CAR')).toBe('Ô tô');
    expect(mapVehicleType('BICYCLE')).toBe('Xe đạp');
  });
});
