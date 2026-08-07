import { VoucherRecord } from './types';

export function mapVoucherRecord(
  item: Record<string, unknown>,
  statusOverrides: Record<string, boolean>,
): VoucherRecord {
  const itemKey = (item.id || item.key) as string;
  let isActive = true;

  if (statusOverrides[itemKey] !== undefined) {
    isActive = statusOverrides[itemKey];
  } else if (item.isActive !== undefined) {
    isActive = Boolean(item.isActive);
  }

  return {
    id: String(item.id || item.key || ''),
    key: itemKey,
    code: String(item.code || ''),
    type: String(item.type || 'Platform'),
    discountType: (String(item.discountType || 'fixed') === 'percent' ? 'percent' : 'fixed') as
      'percent' | 'fixed',
    discountValue: Number(item.discountValue) || 0,
    minOrderValue: Number(item.minOrderValue) || 0,
    validFrom: String(item.validFrom || ''),
    validTo: String(item.validTo || ''),
    usedCount: Number(item.usedCount) || 0,
    totalLimit: Number(item.totalLimit) || 0,
    isActive,
  };
}
