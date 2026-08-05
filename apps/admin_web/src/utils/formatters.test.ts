import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDistance, truncateText } from './formatters';

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
});
