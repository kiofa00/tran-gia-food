import { apiClient } from './apiClient';

export const authService = {
  /**
   * Gọi backend để blacklist refresh token trong Redis.
   * Luôn gọi trước khi signOut() phía client.
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<{
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }> => {
    const res = await apiClient.get('/auth/me');

    return res.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post('/auth/change-password', { currentPassword, newPassword });

    return res.data;
  },
};
