import { mapVehicleType } from '@/utils/formatters';

import { PendingShipperRecord } from './types';

export function mapPendingShipperRecord(item: unknown, idx: number): PendingShipperRecord {
  const s = item as Record<string, unknown>;
  const rawStatus = (s.ekycStatus || s.kycStatus || s.status || 'PENDING').toString().toUpperCase();
  const normalizedStatus =
    rawStatus === 'VERIFIED' || rawStatus === 'APPROVED' ? 'APPROVED' : rawStatus;

  return {
    key: String(s.id || idx + 1),
    id: String(s.id || `S${idx + 1}`),
    name: (s.user as Record<string, string> | undefined)?.name || String(s.name || ''),
    phone: (s.user as Record<string, string> | undefined)?.phone || String(s.phone || ''),
    vehicle: mapVehicleType(String(s.vehicle || s.vehicleType || '')),
    plate: String(s.plate || s.licensePlate || ''),
    status: normalizedStatus,
    rawStatus,
  };
}
