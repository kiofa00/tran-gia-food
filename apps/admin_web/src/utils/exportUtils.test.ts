import { describe, expect, it } from 'vitest';

import { convertToCsv } from './exportUtils';

describe('exportUtils', () => {
  it('should return empty string when data is empty', () => {
    const csv = convertToCsv([], [{ header: 'Tên', key: 'name' }]);

    expect(csv).toBe('');
  });

  it('should convert array of objects to CSV with headers and rows', () => {
    const data = [
      { id: '1', name: 'Quán Phở Bắc', amount: 150000 },
      { id: '2', name: 'Trà Sữa KOI', amount: 75000 },
    ];

    const columns = [
      { header: 'Mã', key: 'id' as const },
      { header: 'Tên Quán', key: 'name' as const },
      {
        header: 'Số Tiền (đ)',
        key: (item: (typeof data)[0]) => `${item.amount.toLocaleString('vi-VN')}đ`,
      },
    ];

    const csv = convertToCsv(data, columns);
    const lines = csv.split('\r\n');

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('"Mã","Tên Quán","Số Tiền (đ)"');
    expect(lines[1]).toContain('"Quán Phở Bắc"');
    expect(lines[2]).toContain('"Trà Sữa KOI"');
  });

  it('should handle quotes and null/undefined values properly', () => {
    const data = [{ id: '1', note: 'Ghi chú có "ngoặc kép"', extra: null }];

    const columns = [
      { header: 'Mã', key: 'id' as const },
      { header: 'Ghi Chú', key: 'note' as const },
      { header: 'Phụ', key: 'extra' as const },
    ];

    const csv = convertToCsv(data, columns);

    expect(csv).toContain('""ngoặc kép""');
    expect(csv).toContain('""');
  });
});
