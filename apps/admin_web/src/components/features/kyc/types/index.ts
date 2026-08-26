export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KycRecord {
  key: string;
  id: string;
  name: string;
  phone: string;
  cccd: string;
  vehicleType: string;
  submittedAt: string;
  status: KycStatus;
  cccdFrontUrl?: string;
  cccdBackUrl?: string;
  driverLicenseUrl?: string;
  vehicleRegUrl?: string;
  selfieUrl?: string;
  rejectReason?: string;
}
