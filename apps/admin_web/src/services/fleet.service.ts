import { apiClient, QueryParams } from './apiClient';

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
  getFleetShippers: async (params?: QueryParams): Promise<any> => {
    const res = await apiClient.get('/admin/fleet', { params });
    return res.data;
  },
};
