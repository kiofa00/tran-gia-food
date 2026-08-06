import { apiClient } from './apiClient';

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
  getFleetShippers: async (): Promise<FleetShipperItem[]> => {
    const res = await apiClient.get<FleetShipperItem[]>('/admin/fleet');
    return res.data;
  },
};
