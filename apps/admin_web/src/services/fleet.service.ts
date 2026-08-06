import { QueryParams, apiClient } from './apiClient';

export interface FleetShipperItem {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  lat: number;
  lng: number;
  status: string;
}

export const fleetService = {
  getFleetShippers: async (params?: QueryParams): Promise<Record<string, unknown>> => {
    const res = await apiClient.get('/admin/fleet', { params });

    return res.data;
  },
};
