import { apiClient } from './apiClient';

export const authService = {
  /**
   * Gọi backend để blacklist refresh token trong Redis.
   * Luôn gọi trước khi signOut() phía client.
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
