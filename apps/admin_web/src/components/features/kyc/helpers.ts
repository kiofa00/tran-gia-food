import { KycItemResponse } from '@/services/kyc.service';

import type { KycRecord, KycStatus } from './types';

export function mapKycItemToRecord(item: KycItemResponse, idx: number): KycRecord {
  const user = item.user || {};
  const statusRaw = String(
    item.ekycStatus ?? item.kycStatus ?? item.status ?? 'PENDING',
  ).toUpperCase();
  const normalizedStatus: KycStatus =
    statusRaw === 'VERIFIED' ? 'APPROVED' : (statusRaw as KycStatus);

  const fallbackReason =
    normalizedStatus === 'REJECTED'
      ? item.rejectReason ||
        'Ảnh chụp giấy tờ CCCD/Bằng lái bị mờ hoặc không khớp thông tin đăng ký'
      : item.rejectReason;

  return {
    key: String(item.id ?? idx),
    id: String(item.id ?? idx),
    name: String(user.name ?? item.name ?? 'Chưa cập nhật'),
    phone: String(user.phone ?? item.phone ?? ''),
    cccd: String(item.cccd ?? item.cccdNumber ?? (item.plate || '')),
    vehicleType: String(item.vehicleType ?? 'motorbike'),
    submittedAt: String(item.submittedAt ?? item.createdAt ?? ''),
    status: normalizedStatus || 'PENDING',
    cccdFrontUrl: item.cccdFrontUrl,
    cccdBackUrl: item.cccdBackUrl,
    driverLicenseUrl: item.driverLicenseUrl,
    vehicleRegUrl: item.vehicleRegUrl,
    selfieUrl: item.selfieUrl,
    rejectReason: fallbackReason,
  };
}
