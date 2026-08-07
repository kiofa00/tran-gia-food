import { CommissionRecord } from '@/types';

export function mapCommissionRecord(item: Record<string, unknown>, idx: number): CommissionRecord {
  return {
    key: String(item.id || item.key || idx + 1),
    orderId: String(item.orderId || `ORD-${item.id || idx + 1}`),
    restaurantName: String(item.restaurantName || item.restaurant || 'Quán ăn'),
    foodAmount: Number(item.foodAmount || item.totalFoodGmv) || 0,
    shipAmount: Number(item.shipAmount || item.shipFee) || 0,
    restaurantShare: Number(item.restaurantShare) || 0,
    shipperShare: Number(item.shipperShare) || 0,
    platformShare: Number(item.platformShare || item.platformCommission) || 0,
    status: item.status === 'PAID' || item.status === 'PROCESSED' ? 'PROCESSED' : 'PENDING',
    createdAt: String(item.createdAt || ''),
  };
}
