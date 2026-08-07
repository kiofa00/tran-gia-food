import { QueryParams, apiClient } from './apiClient';

export type UserRole = 'CUSTOMER' | 'RESTAURANT_OWNER' | 'SHIPPER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface UserItem {
  id: string;
  key: string;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole | string;
  status: UserStatus | string;
  createdAt: string;
}

const API_ENDPOINTS = {
  users: '/admin/users',
  userStatus: (id: string) => `/admin/users/${id}/status`,
} as const;

export const usersService = {
  getUsers: async (params?: QueryParams): Promise<UserItem[] | Record<string, unknown>> => {
    const res = await apiClient.get(API_ENDPOINTS.users, { params });

    return res.data;
  },

  updateStatus: async (id: string, status: string): Promise<{ id: string; status: string }> => {
    const res = await apiClient.patch(API_ENDPOINTS.userStatus(id), { status });

    return res.data;
  },
};
