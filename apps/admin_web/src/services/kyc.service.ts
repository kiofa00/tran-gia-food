import { QueryParams, apiClient } from './apiClient';

export interface KycItemResponse {
  id: string;
  key?: string;
  name?: string;
  phone?: string;
  cccd?: string;
  cccdNumber?: string;
  vehicleType?: string;
  plate?: string;
  vehiclePlate?: string;
  status?: string;
  ekycStatus?: string;
  kycStatus?: string;
  submittedAt?: string;
  createdAt?: string;
  cccdFrontUrl?: string;
  cccdBackUrl?: string;
  driverLicenseUrl?: string;
  vehicleRegUrl?: string;
  selfieUrl?: string;
  rejectReason?: string;
  user?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
}

export const kycService = {
  getKycApplications: async (params?: QueryParams): Promise<KycItemResponse[]> => {
    const res = await apiClient.get<unknown>('/admin/kyc/shippers', { params });
    const data = res.data;

    if (Array.isArray(data)) {
      return data as KycItemResponse[];
    }
    if (
      data !== null &&
      typeof data === 'object' &&
      Array.isArray((data as { data?: unknown }).data)
    ) {
      return (data as { data: KycItemResponse[] }).data;
    }

    return [];
  },

  approveKyc: async (id: string) => {
    const res = await apiClient.patch(`/admin/shippers/${id}/kyc`, { status: 'VERIFIED' });

    return res.data;
  },

  rejectKyc: async (id: string, reason?: string) => {
    const res = await apiClient.patch(`/admin/shippers/${id}/kyc`, {
      status: 'REJECTED',
      rejectReason: reason,
    });

    return res.data;
  },
};
