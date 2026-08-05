import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDistance, truncateText, mapKycStatus, mapShipperStatus, mapOrderStatus } from './formatters';

describe('formatters utility', () => {
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
});
