import axios from 'axios';

import { ADMIN_ROUTES } from '@/shared-config';

/**
 * All API calls go through the Next.js proxy at /api/proxy/*.
 * The proxy injects the Authorization token server-side (no client-side getSession()).
 * This also hides the backend URL from the browser.
 */
export const apiClient = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Session expired — redirect to login
      window.location.href = ADMIN_ROUTES.LOGIN;
    }
    console.error('API Error:', error?.response?.data ?? error.message);

    return Promise.reject(error);
  },
);

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  userStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}
