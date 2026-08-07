import { QueryParams, apiClient } from './apiClient';

export const fleetService = {
  getFleetShippers: async (params?: QueryParams): Promise<Record<string, unknown>> => {
    const res = await apiClient.get('/admin/fleet', { params });

    return res.data;
  },
};
