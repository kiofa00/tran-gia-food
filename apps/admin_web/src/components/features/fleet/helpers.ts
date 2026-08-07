import { ShipperRecord } from '@/types';

export function mapShipperRecord(item: Record<string, unknown>, idx: number): ShipperRecord {
  return {
    id: String(item.id || item.key || idx + 1),
    key: String(item.id || item.key || idx + 1),
    name: String(item.name || ''),
    phone: String(item.phone || ''),
    vehicle: String(item.vehicle || 'MOTORBIKE'),
    plate: String(item.plate || ''),
    lat: Number(item.lat) || 0,
    lng: Number(item.lng) || 0,
    status: String(item.status || 'OFFLINE'),
    ekycStatus: String(item.ekycStatus || 'PENDING'),
    rating: Number(item.rating) || 5.0,
  };
}
