import { QueryParams, apiClient } from './apiClient';

export const restaurantsService = {
  getRestaurants: async (params?: QueryParams) => {
    const res = await apiClient.get('/admin/restaurants', { params });

    return res.data;
  },
  approveRestaurant: async (id: string) => {
    const res = await apiClient.patch(`/admin/restaurants/${id}/approve`, {});

    return res.data;
  },
  suspendRestaurant: async (id: string, reason: string) => {
    const res = await apiClient.patch(`/admin/restaurants/${id}/suspend`, { reason });

    return res.data;
  },
  getRestaurantDetail: async (id: string) => {
    const res = await apiClient.get(`/admin/restaurants/${id}`);

    return res.data;
  },
};
